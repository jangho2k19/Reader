import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';

/**
 * Split text into sentences using Intl.Segmenter if available,
 * with reliable regex fallback.
 */
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];
  
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = Array.from(segmenter.segment(text));
    return segments
      .map(s => s.segment.trim())
      .filter(s => s.length > 0);
  }

  // Regex fallback: split by period, exclamation, question mark followed by space or newline
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9"“'’])/g, '$1|__SENT_SPLIT__|')
    .split('|__SENT_SPLIT__|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Split text into paragraphs, and each paragraph into sentences.
 */
function structureContent(textContent) {
  const rawParagraphs = textContent
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const paragraphs = [];
  const allSentences = [];
  let sentenceCounter = 0;

  for (const para of rawParagraphs) {
    const sentences = splitIntoSentences(para);
    if (sentences.length === 0) continue;

    const sentenceObjects = sentences.map(text => {
      const id = sentenceCounter++;
      const item = { id, text, wordCount: text.split(/\s+/).filter(Boolean).length };
      allSentences.push(item);
      return item;
    });

    paragraphs.push({
      sentences: sentenceObjects,
      rawText: para
    });
  }

  return { paragraphs, allSentences };
}

/**
 * Extract article content and metadata from a web page URL.
 */
export async function extractArticle(targetUrl) {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const parsedUrl = new URL(url);

  // Fetch the HTML with realistic browser headers
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    timeout: 15000,
    maxRedirects: 5
  });

  const html = response.data;
  if (!html || typeof html !== 'string') {
    throw new Error('Received empty or non-HTML response from the website.');
  }

  // Parse metadata using Cheerio
  const $ = cheerio.load(html);
  const metaTitle =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text().trim();

  const metaDescription =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    '';

  const metaSiteName =
    $('meta[property="og:site_name"]').attr('content') ||
    parsedUrl.hostname.replace(/^www\./, '');

  const metaAuthor =
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    $('meta[name="twitter:creator"]').attr('content') ||
    null;

  const metaPublishedTime =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    null;

  const coverImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    null;

  // Use Mozilla Readability for article content extraction
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document, {
    charThreshold: 80,
    keepClasses: false
  });

  const article = reader.parse();

  let finalTitle = metaTitle;
  let finalContentHtml = '';
  let finalPlainText = '';
  let finalByline = metaAuthor;

  if (article && article.textContent && article.textContent.trim().length > 100) {
    finalTitle = article.title || metaTitle;
    finalContentHtml = article.content || '';
    finalPlainText = article.textContent.trim();
    finalByline = article.byline || metaAuthor;
  } else {
    // Fallback: extract main text using Cheerio by stripping unwanted elements
    $('script, style, noscript, nav, header, footer, aside, form, svg, iframe, .ads, .ad, .cookie-banner').remove();
    
    // Search best candidate container
    const candidates = ['main', 'article', '[role="main"]', '.post-content', '.entry-content', '.article-body', '#content'];
    let bestEl = null;

    for (const selector of candidates) {
      if ($(selector).length > 0 && $(selector).text().trim().length > 150) {
        bestEl = $(selector).first();
        break;
      }
    }

    if (!bestEl) {
      bestEl = $('body');
    }

    finalPlainText = bestEl.text().replace(/\s\s+/g, ' \n').trim();
    finalContentHtml = bestEl.html() || `<p>${finalPlainText}</p>`;
  }

  if (!finalPlainText || finalPlainText.length < 30) {
    throw new Error('Could not find enough readable article text on this page.');
  }

  // Structure text into paragraphs & sentence objects for interactive TTS and reader
  const { paragraphs, allSentences } = structureContent(finalPlainText);
  const words = finalPlainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average 200 wpm
  const estimatedListeningTime = Math.max(1, Math.ceil(wordCount / 140)); // Average 140 wpm for TTS

  return {
    url,
    domain: parsedUrl.hostname.replace(/^www\./, ''),
    title: finalTitle || 'Untitled Article',
    byline: finalByline,
    siteName: metaSiteName,
    excerpt: metaDescription || (finalPlainText.slice(0, 180) + '...'),
    coverImage,
    publishedTime: metaPublishedTime,
    wordCount,
    estimatedReadingTime,
    estimatedListeningTime,
    paragraphs,
    sentences: allSentences,
    textContent: finalPlainText,
    htmlContent: finalContentHtml
  };
}

/**
 * Process raw pasted text directly into structured format.
 */
export function processRawText(rawText, title = 'Untitled Document') {
  if (!rawText || !rawText.trim()) {
    throw new Error('Text cannot be empty.');
  }

  const cleanText = rawText.trim();
  const { paragraphs, allSentences } = structureContent(cleanText);
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));
  const estimatedListeningTime = Math.max(1, Math.ceil(wordCount / 140));

  return {
    url: null,
    domain: 'Pasted Text',
    title: title.trim() || 'Custom Document',
    byline: 'User Input',
    siteName: 'Manual Text',
    excerpt: cleanText.slice(0, 160) + '...',
    coverImage: null,
    publishedTime: new Date().toISOString(),
    wordCount,
    estimatedReadingTime,
    estimatedListeningTime,
    paragraphs,
    sentences: allSentences,
    textContent: cleanText,
    htmlContent: paragraphs.map(p => `<p>${p.rawText}</p>`).join('\n')
  };
}

