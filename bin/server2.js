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

const get_codeconfig = (code_config) => {
  /**
   * 将二维码的配置信息提取出来
   * @return {JSON}
   */

  const config = {
    "server": "",
    "server_port": 0,
    "password": "",
    "method": "",
    "remarks": "",
    "timeout": 5
  } // 配置信息

  const method_password = code_config.split('@')[0].trim()
  const server_server_port = code_config.split('@')[1].trim()

  config.server = server_server_port.split(':')[0].trim()
  config.server_port = server_server_port.split(':')[1].trim()
  config.password = method_password.split(':')[1].trim() ? method_password.split(':')[1].trim() : ''
  config.method = method_password.split(':')[0].trim()
  return config
}

const getcode_config = (decode_urls) => {
  /**
   * 在线获取二维码配置信息，并将信息进行 base64 解码
   * @return {NULL}
   */

  for (let k = 0; k < decode_urls.length; k++) {
    let req = https.get(decode_urls[k], (res) => {
      let html = '' // 用来存储抓取到网页内容
      res.setEncoding('utf-8') // 防止乱码
      res.on('data', (chunk) => {
        html += chunk
      })

      res.on('end', () => {
        const $ = cheerio.load(html)
        const result = $("#result")
        const tr = result.find('tr').eq(0)
        const code = tr.find('pre').text().split('//')
        let code_config = new Buffer(code[1], 'base64').toString().trim() // base 64 解码
        let code_configs = get_codeconfig(code_config)
        const SS_config = JSON.parse(fs.readFileSync(SS_CONFIG)) // 将配置读取进来
        let SS_configs = SS_config["configs"]
        SS_configs.push(code_configs)
        fs.writeFileSync(SS_CONFIG, JSON.stringify(SS_config, null, 2))
      })
    })
  }

}

const geth4_config = (obj) => {
  /**
   * 如果没有提供二维码，将直接读取 dom 节点中的配置
   * @return {NULL}
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
  // console.log(h4text)
  config.server = h4text[0].split(':')[1] || h4text[0].split('：')[1]
  config.server_port = h4text[1].split(':')[1] || h4text[1].split('：')[1]
  config.password = h4text[2].split(':')[1] || h4text[2].split('：')[1] ? h4text[2].split(':')[1] || h4text[2].split('：')[1] : ''
  config.method = h4text[3].split(':')[1] || h4text[3].split('：')[1]

  const SS_config = JSON.parse(fs.readFileSync(SS_CONFIG)) // 将配置读取进来
  let SS_configs = SS_config["configs"]
  SS_configs.push(config)
  fs.writeFileSync(SS_CONFIG, JSON.stringify(SS_config, null, 2))
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
      let decode_urls = []
      let h4 = []

      for (let i = 0; i < portfolio.length; i++) {
        let imgsrc = portfolio.eq(i).find("h4:last-child a").attr('href')
        if (imgsrc) {
          imgsrc = "https://ss.ishadowx.net/" + imgsrc
          decode_urls.push("https://zxing.org/w/decode?u=" + encodeURIComponent(imgsrc))
        } else {
          let h4 = portfolio.eq(i).find('h4').not('h4:last-child')
          geth4_config(h4)
        }
      }
      getcode_config(decode_urls)
    })
  })
}

setInterval(() => {
  /**
   * 每一小时执行一次爬虫, 只在当天 0 点, 6点, 12 点, 24 点 更新配置
   * @return {NULL}
   */

  let this_hours = new Date().getHours()

  if (this_hours === 0 || this_hours === 6 || this_hours === 17 || this_hours === 24) {
    const SS_config = JSON.parse(fs.readFileSync(SS_CONFIG)) // 将配置读取进来
    let SS_configs = deleteDefault(SS_config["configs"])
    fs.writeFileSync(SS_CONFIG, JSON.stringify(SS_config, null, 2))
    fetchConfig(url)
  }
}, 60 * 60 * 1000)

fetchConfig(url)
