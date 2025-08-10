import { JSDOM } from 'jsdom';

/**
 * 指定されたURLからすべてのリンクを抽出する
 * @param url - 抽出対象のURL
 * @returns Promise<string[]> - 抽出されたリンクの配列
 */
export async function extractLinksFromUrl(url: string): Promise<string[]> {
  try {
    // URLからHTMLを取得
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // JSDOMを使用してHTMLを解析
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // すべてのaタグを取得
    const linkElements = document.querySelectorAll('a[href]');
    
    // href属性を抽出して配列に変換
    const links: string[] = Array.from(linkElements)
      .map(link => link.getAttribute('href'))
      .filter((href): href is string => href !== null)
      .map(href => {
        // 相対URLを絶対URLに変換
        try {
          return new URL(href, url).href;
        } catch {
          // 無効なURLの場合はそのまま返す
          return href;
        }
      });
    
    // 重複を削除
    return [...new Set(links)];
    
  } catch (error) {
    console.error('Error extracting links:', error);
    throw error;
  }
}
  
  // 使用例
  async function main() {
    const targetUrl = ' https://mastra.ai/';
    
    try {
      console.log('基本的なリンク抽出:');
      const links = await extractLinksFromUrl(targetUrl);
      links.forEach((link, index) => {
        console.log(`${index + 1}: ${link}`);
      });
      
    } catch (error) {
      console.error('メイン関数でエラーが発生しました:', error);
    }
  }
