const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Builder, By, Key, until } = require("selenium-webdriver");
const fs = require("fs");
const log = require("electron-log");
const chrome = require("selenium-webdriver/chrome");
const axios = require("axios");
const AdmZip = require("adm-zip");
const moment = require("moment");
const https = require("https");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = async () => {
  await defaultSetting();
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.openDevTools();
  attendance();
  inspection();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const defaultSetting = async () => {
  const folderPath = "C:/dev";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const chromedriverUrl =
    "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/120.0.6099.109/win64/chromedriver-win64.zip";
  const zipPath = "C:/dev/chromedriver.zip";
  try {
    const response = await axios.get(chromedriverUrl, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(zipPath, response.data);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo("C:/dev/", true);
    // 다운로드한 zip 파일 삭제
    fs.unlinkSync(zipPath);
  } catch (err) {
    console.log(err);
  }
};

const login = async () => {
  const filePath = "C:/dev/config.txt";
  const dataStr = fs.readFileSync(filePath, { encoding: "utf8" });
  const data = JSON.parse(dataStr);
  try {
    const chromedriverPath = "C:/dev/chromedriver-win64/chromedriver.exe";
    const driver = new Builder()
      .forBrowser("chrome")
      .setChromeService(new chrome.ServiceBuilder(chromedriverPath))
      .build();

    await driver.get("https://play.daekyo.co.kr/login");

    const id = await driver.findElement(By.id("username"));
    id.sendKeys(data.id);
    const pwd = await driver.findElement(By.id("password"));
    pwd.sendKeys(data.pwd, Key.RETURN);
    return driver;
  } catch (err) {
    log.error(err);
  }
};

ipcMain.on("getUserInfo", (event) => {
  const filePath = "C:/dev/config.txt";
  try {
    // 파일이 없으면 생성하고 데이터 저장
    if (!fs.existsSync(filePath)) {
      const initialData = {
        /* 초기 데이터 */
        id: "",
        pwd: "",
      };
      fs.writeFileSync(filePath, JSON.stringify(initialData), {
        encoding: "utf8",
      });
    }

    // 파일 데이터 읽기
    const dataStr = fs.readFileSync(filePath, { encoding: "utf8" });
    const data = JSON.parse(dataStr);
    event.reply("data", data);
  } catch (err) {
    console.error(err);
  }
});

ipcMain.on("changeInfo", (event, data) => {
  const filePath = "C:/dev/config.txt";
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), {
      encoding: "utf8",
    });
    event.reply("changeSuccess");
  } catch (err) {
    console.error(err);
  }
});

ipcMain.on("getSelectBoxOption", async (event, data) => {
  const driver = await login();
  await driver.wait(until.elementLocated(By.css('span[title="협업"]')), 5000);

  const cookies = await driver.manage().getCookies();
  let loginToken = cookies.filter((v) => v.name == "GOSSOcookie")[0].value;
  const url = `https://play.daekyo.co.kr/api/works/applets/436/form`;
  const options = {
    method: "get",
    headers: {
      Cookie: `GOSSOcookie=${loginToken};`,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, //허가되지 않은 인증을 reject하지 않겠다!
    }),
  };

  axios(url, options).then((res) => {
    event.reply("getSelectBoxOption", res.data);
  });

  await driver.close();
});

const inspection = () => {
  ipcMain.on("inspection", async (event, data) => {
    const driver = await login();

    await driver.wait(until.elementLocated(By.css('span[title="협업"]')), 5000);

    await driver.executeScript(() => {
      window.location.href = "/app/works/applet/436/doc/new";
    });

    await driver.wait(until.elementLocated(By.id("_6emrs0lh3_-999")), 5000);

    await driver.findElement(By.id("_6emrs0lh3_0")).click();
    await driver.findElement(By.id("_kyuyxfj19_2")).click();
    await driver.findElement(By.id("_19u7b5hxi_2")).click();
    await driver.findElement(By.id("_sk99cdqnf_0")).click();
    await driver.findElement(By.id("_3uf0h08mu_0")).click();
    await driver.findElement(By.id("_8fijlejcz_1")).click();
    await driver.findElement(By.id("_19u7b5hxi_0")).click();
    await driver.findElement(By.id("_xr1nr2dd8_0")).click();
    await driver.findElement(By.id("_kh9z0p3e8_2")).click();
    await driver.findElement(By.id("_zei36fho5_0")).click();
    await driver.findElement(By.id("_rcs1ugja3_0")).click();

    await driver
      .findElement(By.css('input[name="_xcpufronm"]'))
      .sendKeys("https://www.daekyo.com/kr/index");

    await driver
      .findElement(By.css('input[name="_5mlt8bw02"]'))
      .sendKeys("일 배치 매일 00시 00분에 실행  (신고하기 관리자 서비스)");

    await driver
      .findElement(By.css('input[name="_kzmkdcimc"]'))
      .sendKeys("https://brandad.daekyo.com/backoffice/login");

    await driver
      .findElement(By.css('input[name="_km6in9c8i"]'))
      .sendKeys("주식정보 API, 구글OTP, 다음지도");

    await driver
      .findElement(By.css('input[name="_eoml6codr"]'))
      .sendKeys("메인 페이지 동영상, 주식정보");

    const selectBox = await driver.findElement(
      By.css('[name="select_option"]')
    );
    const desiredOptionText = "[전사웹] 대교닷컴"; // 선택하려는 옵션 텍스트로 변경하세요.

    await selectBox
      .findElement(By.xpath(`//option[text()="${desiredOptionText}"]`))
      .click();
  });
};

const attendance = () => {
  ipcMain.on("attendance", async (event, data) => {
    const driver = await login();

    const attendanceEl = await driver.wait(
      until.elementLocated(By.css('li[data-groupid="67"] a')),
      10000
    );

    await attendanceEl.click();

    await driver.wait(until.elementLocated(By.id(`${data}`)), 5000);

    const attendanceBtn = await driver.findElement(By.id(`${data}`));
    await attendanceBtn.click();

    const allHandles = await driver.getAllWindowHandles();

    const newHandle = allHandles[allHandles.length - 1];

    await driver.switchTo().window(newHandle);

    event.reply("success");

    await driver.close();
  });
};
