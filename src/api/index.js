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
