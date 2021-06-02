const puppeteer = require("puppeteer");
const fs = require("fs");

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://en.wikipedia.org/wiki/Lists_of_airports");
  for (let i = 4; i <= 29; i++) {
    var linkToClick = `#mw-content-text > div.mw-parser-output > p:nth-child(5) > a:nth-child(${i})`;
    await page.click(linkToClick);
    await scraper(page, i - 3);
    await page.goBack();
  }
  await browser.close();
};

scrape();

const scraper = async (page, no) => {
  await page.on("load");

  const list = [];
  for (let i = 2; i < 20; i++) {
    const l = await page.$eval(
      `#mw-content-text > div.mw-parser-output > table > tbody > tr:nth-child(${i})`,
      (row) => {
        let rowContent = row.innerText;
        if (rowContent.length > 5) {
          let rec = {
            iata: rowContent.split("\t")[0],
            icao: rowContent.split("\t")[1],
            "airport name": rowContent
              .split("\t")[2]
              .toLowerCase()
              .replace(/[,\s]+|[,\s]+/g, "_"),
            "location served": rowContent
              .split("\t")[3]
              .toLowerCase()
              .replace("  ", "_")
              .replace(/[,\s]+|[,\s]+/g, "_"),
          };
          return rec;
        }
      }
    );
    if (l == null) {
    } else {
      list.push(l);
    }
  }

  fs.writeFile(`page${no}.json`, JSON.stringify(list, null, 2), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Saved succesfully");
    }
  });
};
