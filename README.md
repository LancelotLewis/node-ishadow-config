# node-ishadow-config

> 爬取 iShadow 的 Shadowsocks 免费配置信息

# Tip

> 最近国内对 VPN 这个墙的比较厉害，[ishadowx](https://go.ishadowx.net/) 该网站里面提供的 SS 也是不稳定，所以请思量清楚之后在使用

# Shadowsocks 配置来源

> [ishadowx](https://go.ishadowx.net/)

# shadowsocks-windows

> [shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows/releases)

# 爬虫脚本功能

> [ishadowx](https://go.ishadowx.net/) 将会在 0/6/12/24 时间段更新所有服务器的配置,脚本爬虫也将会在这个时间段进行爬取配置信息, 最后会将爬取到的所有配置信息以 JSON 数据形式保存到 Shadowsocks 软件安装目录下的 gui-config.json 文件

# 配置

> 需要配置 ./config/config.json 中的 SS_HOiME 值, 将你的 Shadowsocks 安装文件夹绝对路径填入即可, 需要注意的是要使用 `\\` 来表示路径

## 默认配置

```json
{
  "SS_HOME": "E:\\Shadowsocks\\",
  "URL": "https://go.ishadowx.net/"
}
```

## Shadowsocks 推荐配置

- 启动系统代理
- 系统代理模式 => 全局模式
- 服务器 => 高可用 或者 均衡负载
- 允许来自局域网的连接

# 下载运行

```bash
# 下载源代码
git clone git@github.com/vxhly/node-ishadow-config.git

# 切换目录
cd node-ishadow-config

# 安装依赖
npm install

# 开启服务，版本 1，直接获取 dom 节点中的配置
npm run server1

# 开启服务，版本 2，部分读取二维码配置，将更准确
npm run server2
```
