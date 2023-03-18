const webdriver = require("selenium-webdriver");
const { By, Key, until } = webdriver;
const chrome = require("selenium-webdriver/chrome");
const express = require("express");
const path = require("path");
require("dotenv").config();
const { env } = process;
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client")));

app.post("/api/data", async (req, res) => {
  console.log(req.body.input);
  const txt = req.body.input;
  let { data } = await chatGpt(txt);
  let text = data.choices[0].message.content;
  console.log("text:", text);
  let val;
  // if (!Array.isArray(text)) {
  let newText = data.choices[0].message.content;
  // newText =
  //   '\
  // ```javascript\
  // const samosaIngredients = ["Potatoes", "Peas", "Onion", "Garlic", "Ginger", "Chili peppers", "Turmeric", "Coriander powder", "Garam masala", "Cumin seeds", "Mustard seeds", "Lemon juice", "Oil", "Water", "Salt", "Pastry sheets"];\
  // ```';
  newText = newText.replace(/```/g, "");
  const startIndex = newText.indexOf("[");
  const endIndex = newText.lastIndexOf("]");
  const myArray = JSON.parse(newText.substring(startIndex, endIndex + 1));
  val = myArray;
  // }
  console.log("match", val);
  // val = [
  //   "potatoes",
  //   "peas",
  //   "onions",
  //   "green chilies",
  //   "ginger",
  //   "garlic",
  //   "coriander",
  //   "cumin",
  //   "garam masala",
  //   "turmeric",
  //   "salt",
  //   "oil",
  //   "flour",
  //   "water",
  // ];
  val.length = 5;
  const items = await getAllData(val);
  return res.send({ data: items });
  // Todo call again if no array is passed
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

async function getData(word) {
  let chromeOptions = new chrome.Options();
  chromeOptions.addArguments("--headless=new");
  let driver = new webdriver.Builder()
    .forBrowser(webdriver.Browser.CHROME)
    .setChromeOptions(chromeOptions)
    .build();
  try {
    await driver.get("https://www.carrefourksa.com/mafsau/en/");
    await driver
      .findElement(
        By.xpath("/html/body/div/div/div[1]/div[1]/div[1]/div[3]/div/input")
      )
      .sendKeys(word, Key.RETURN);
    await driver.wait(
      until.elementLocated(
        By.xpath(
          "/html/body/div/div[3]/div/div[3]/div[2]/div[3]/ul/div/div[1]/div/div/div[1]/div/ul/div[2]/div[3]/div[3]/div[1]/div"
        )
      ),
      40000
    );

    title = await driver
      .findElement(
        By.xpath(
          "/html/body/div/div[3]/div/div[3]/div[2]/div[3]/ul/div/div[1]/div/div/div[1]/div/ul/div[2]/div[3]/div[1]/a"
        )
      )
      .getText();
    price = await driver
      .findElement(
        By.xpath(
          "/html/body/div/div[3]/div/div[3]/div[2]/div[3]/ul/div/div[1]/div/div/div[1]/div/ul/div[2]/div[3]/div[3]/div[1]/div"
        )
      )
      .getText();
    image_url = await driver
      .findElement(
        By.xpath(
          "/html/body/div/div[3]/div/div[3]/div[2]/div[3]/ul/div/div[1]/div/div/div[1]/div/ul/div[2]/div[1]/div/a/img"
        )
      )
      .getAttribute("src");

    console.log("title:", title);
    console.log("price:", price);
    console.log("image_url:", image_url);
    return {
      title,
      price,
      imgUrl: image_url,
    };
  } finally {
    await driver.quit();
  }
}

async function chatGpt(input) {
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `"what is the top 5 main ingredient of ${input}, give it to me as a list as javascript array"`,
      },
    ],
  };
  // console.log(data);
  try {
    const res = await axios({
      method: "post",
      url: "https://experimental.willow.vectara.io/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "customer-id": env.CUSTOMER_ID,
        "x-api-key": env.X_API_KEY,
      },
      data: {
        ...data,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
}

async function getAllData(items) {
  const results = await Promise.all(items.map((item) => getData(item)));
  return results;
}
