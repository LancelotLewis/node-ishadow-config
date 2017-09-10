import https from 'https'
import fs from 'fs'
import cheerio from 'cheerio'
import request from 'request'

const json_config = ".\\config\\config.json"
const config_result = JSON.parse(fs.readFileSync(json_config))
const SS_HOME = config_result["SS_HOME"]
const SS_CONFIG = SS_HOME + 'gui-config.json' // 配置信息将会存储在这个文件中

const url = config_result["URL"] // 爬取的网页

const deleteDefault = (json) => {
  /**
   * 去除默认配置
   * @return {JSON}
   */

  if (json.length != 0) {
    json.splice(0, json.length)
  }
  return json
}

const fetchConfig = (url) => {
  /**
   * 爬取配置信息并将配置信息写入 JSON 数组
   * @return {NULL}
   */

  https.get(url, (res) => {
    let html = '' // 用来存储抓取到网页内容
    res.setEncoding('utf-8') // 防止乱码
    res.on('data', (chunk) => {
      html += chunk
    })

    res.on('end', () => {
      const $ = cheerio.load(html)
      const portfolio = $('#portfolio .hover-text')
      const SS_config = JSON.parse(fs.readFileSync(SS_CONFIG)) // 将配置读取进来
      let SS_configs = deleteDefault(SS_config["configs"])

      for (let i = 0; i < portfolio.length; i++) {
        const h4 = portfolio.eq(i).find('h4').not('h4:last-child')
        const configs = get_config(h4)
        SS_configs.push(configs) // push 到 JSON 数组

        console.log(JSON.stringify(configs, null, 2))
      }
      fs.writeFileSync(SS_CONFIG, JSON.stringify(SS_config, null, 2)) // 将配置格式化成 JSON 数组后写入文件
    })
  })
}

const get_config = (obj) => {
  /**
   * 截取有用的配置信息
   * @return {JSON}
   */

  let h4text = [] // 存储文本信息

  let config = {
    "server": "",
    "server_port": 0,
    "password": "",
    "method": "",
    "remarks": "",
    "timeout": 5
  } // 配置信息

  for (let i = 0; i < obj.length; i++) {
    h4text.push(obj.eq(i).text().trim())
  }
  config.server = h4text[0].split(':')[1] || h4text[0].split('：')[1]
  config.server_port = h4text[1].split(':')[1] || h4text[1].split('：')[1]
  config.password = h4text[2].split(':')[1] || h4text[2].split('：')[1] ? h4text[2].split(':')[1] || h4text[2].split('：')[1] : ''
  config.method = h4text[3].split(':')[1] || h4text[3].split('：')[1]
  return config
}

setInterval(() => {
  /**
   * 每一小时执行一次爬虫, 只在当天 0 点, 6点, 12 点, 24 点 更新配置
   * @return {NULL}
   */

  let this_hours = new Date().getHours()
  
  if (this_hours === 0 || this_hours === 6 || this_hours === 12 || this_hours === 24) {
    fetchConfig(url)
  }
}, 60 * 60 * 1000)

fetchConfig(url)
