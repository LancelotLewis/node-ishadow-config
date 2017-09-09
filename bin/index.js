import https from 'https'
import fs from 'fs'
import cheerio from 'cheerio'
import request from 'request'

const config = ".\\config\\config.json"
const config_result = JSON.parse(fs.readFileSync(config))
const SS_HOME = config_result["SS_HOME"]
let SS_CONFIG = SS_HOME + 'gui-config.json'

const url = config_result["URL"]

const deleteDefault = (json) => {
  if (json.length != 0) {
    json.splice(0, json.length)
  }
  return json
}

const fetchConfig = (url) => {
  https.get(url, (res) => {
    let html = '' // 用来存储抓取到网页内容
    res.setEncoding('utf-8') // 防止乱码
    res.on('data', (chunk) => {
      html += chunk
    })

    res.on('end', () => {
      const $ = cheerio.load(html)
      const portfolio = $('#portfolio .hover-text')
      const SS_config = JSON.parse(fs.readFileSync(SS_CONFIG))
      const SS_configs = deleteDefault(SS_config["configs"])

      for (let i = 0; i < portfolio.length; i++) {
        const h4 = portfolio.eq(i)
          .find('h4')
          .not('h4:last-child')
        const configs = get_config(h4)
        SS_configs.push(configs)

        console.log(JSON.stringify(configs, null, 2))
      }
      // console.log(SS_configs)
      fs.writeFileSync(SS_CONFIG, JSON.stringify(SS_config, null, 2))
    })
  })
}

const get_config = (obj) => {
  let h4text = []
  let config = {
    "server": "",
    "server_port": 0,
    "password": "",
    "method": "",
    "remarks": "",
    "timeout": 5
  }
  for (let i = 0; i < obj.length; i++) {
    h4text.push(obj.eq(i)
      .text()
      .trim())
  }
  config.server = h4text[0].split(':')[1] || h4text[0].split('：')[1]
  config.server_port = h4text[1].split(':')[1] || h4text[1].split('：')[1]
  config.password = h4text[2].split(':')[1] || h4text[2].split('：')[1] ? h4text[2].split(':')[1] || h4text[2].split('：')[1] : ''
  config.method = h4text[3].split(':')[1] || h4text[3].split('：')[1]
  return config
}

const this_hours = new Date()
  .getHours()
if (this_hours === 0 || this_hours === 6 || this_hours === 12 || this_hours === 24) {
  fetchConfig(url)
}
