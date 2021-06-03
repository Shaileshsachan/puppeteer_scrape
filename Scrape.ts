const puppeteer = require("puppeteer");
const fs = require("fs");

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true }); //Launch headless without opening the browser on the display
  const page = await browser.newPage();
  await page.goto("https://en.wikipedia.org/wiki/Lists_of_airports"); //async call to entrypoint as mentioned in the assessment DOC
  for (let i = 4; i <= 29; i++) {
    // 4 - 29 for all alphabets (1 - 26)
    var linkToClick = `#mw-content-text > div.mw-parser-output > p:nth-child(5) > a:nth-child(${i})`; //selector of the click on entry page i = 4 is A and so on..
    await page.click(linkToClick); // click on the link tag of the selector
    await scraper(page, i - 3); //call scraper function with the page data and i-3 for page no (A = 1, B= 2, so on...)
    await page.goBack(); //After done scraping back to page of entrypoint and than loop continues for more 25 times...
  }
  await browser.close(); //Close browser after finishing the loop
};

scrape();

const scraper = async (page, no) => {
  const list = []; //list to push individual table data
  for (let i = 2; i < 1000; i++) {
    //running the loop upto length of table just a high value is set to not miss a table row but loop runs just the number of rows times
    const rowData = await page
      .$eval(
        `#mw-content-text > div.mw-parser-output > table > tbody > tr:nth-child(${i})`,
        (row) => {
          let rowContent = row.innerText; //Extracts data from html element

          if (rowContent.length > 5) {
            //For rows which do not contain data and for heading of table(excludes them)
            let rec = {
              iata: rowContent.split("\t")[0], //spliting at tab and storing in ts object
              icao: rowContent.split("\t")[1],
              "airport name": rowContent //converting to lowercase as needed and replaced space and commas with underscore
                .split("\t")[2]
                .toLowerCase()
                .replace(/[,\s]+|[,\s]+/g, "_"), //Use of regular expression to replace (space comma) and (comma space) and (space space) combinations with underscore
              "location served": rowContent
                .split("\t")[3]
                .toLowerCase()
                .replace("  ", "_")
                .replace(/[,\s]+|[,\s]+/g, "_"),
            };
            return rec;
          }
        }
      )
      .catch((err) => true);
    if (rowData == null || rowData == true) {
      //Handling null data and not pushing to list (basically handling headings and nulls)
    } else {
      list.push(rowData);
    }
  }

  fs.writeFile(`page${no}.json`, JSON.stringify(list, null, 2), (err) => {
    //No database mentioned hence stores all files in localstorage
    if (err) {
      console.log(err);
    } else {
      let pageNumber = no + 64;
      console.log(
        `Saved Succesfully airport names for alphabet ${String.fromCharCode(
          pageNumber
        )}`
      ); //Prints succes message for each page number
    }
  });
};
