import { jsonp } from '@/utils/jsonp'

export function getSongList(params) {
  const queryString = new URLSearchParams(params).toString()
  return fetch('https://api.qqmp3.vip/api/songs.php?' + queryString).then((res) => {
    return res.json()
  })
}
export function getSongInfo(id) {
  const params = {
    rid: id,
    type: 'json',
    level: 'exhigh',
    lrc: true
  }
  const queryString = new URLSearchParams(params).toString()
  return fetch('https://api.qqmp3.vip/api/kw.php?' + queryString).then((res) => {
    return res.json()
  })
}
// 查询网易歌单信息
export function getNetEaseSongListInfo(id) {
  const params = {
    type: 'playlist',
    id: id
  }
  return jsonp('https://api.asilu.com/163music', params)
}
