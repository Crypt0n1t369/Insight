
import scrapy
import json

class BasicSpider(scrapy.Spider):
    name = "basic"
    start_urls = ["https://gen-e.eu/gen-e-2026"]
    
    def parse(self, response):
        self.logger.info(f"Scraped: {response.url}")
        
        yield {
            "url": response.url,
            "title": response.css("title::text").get(),
            "headlines": response.css("h1::text, h2::text").getall()[:10],
            "links": response.css("a::attr(href)").getall()[:20],
            "text": response.css("p::text").getall()[:50],
        }
