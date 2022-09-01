module.exports = mangahost_scraper;

const axios = require('axios');
const cheerio = require('cheerio');
const mongodb = require("mongodb");

const url_domain = 'https://mangahosted.com/mangas/page/';

const session = axios.create({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
});

async function mangahost_scraper(collection) {
    try {
        const tmp = cheerio.load(await session.get(url_domain + '1/').then(response => response.data));
        const max_page_count = parseInt(tmp('.last').attr('href').split('/').pop());
        
        console.log('[+][MANGAHOST] Getting Series...');
        
        for (let i = 1; i < max_page_count; i++) {
            let tmp2 = cheerio.load(await session.get(url_domain + i).then(response => response.data));
            
            collection.InsertMany(tmp2('.w-col-3').map((i, el) => {
                const title = tmp2(el).children().find('.manga-block-title-link').attr('title');
                const href = tmp2(el).children().find('.manga-block-title-link').attr('href');
                const img = tmp2(el).children().find('.manga-block-img-img').attr('src');
                
                return {
                    'title': title,
                    'href': href,
                    'img': img,
                }
            }).get());

            let page_sing_or_plural = (i == 1) ? 'page' : 'pages';
            console.log(`[+][MANGAHOST] ${i} ${page_sing_or_plural} processed.`);
        }
    
        console.log('[+][MANGAHOST] Got All Series.');
        
    } catch (error) {
        console.log('[-][MANGAHOST] Error.');
        console.error(error);
    }
}