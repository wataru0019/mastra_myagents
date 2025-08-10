import { JSDOM } from 'jsdom';

async function extractLinksFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const linkElements = document.querySelectorAll("a[href]");
    const links = Array.from(linkElements).map((link) => link.getAttribute("href")).filter((href) => href !== null).map((href) => {
      try {
        return new URL(href, url).href;
      } catch {
        return href;
      }
    });
    return [...new Set(links)];
  } catch (error) {
    console.error("Error extracting links:", error);
    throw error;
  }
}

export { extractLinksFromUrl };
