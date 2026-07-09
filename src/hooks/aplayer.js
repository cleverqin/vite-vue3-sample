import { computed, onMounted, reactive, ref } from 'vue'
import { getSongInfo, getSongList } from '@/api'
export function useAPlayer(audioRef, STORAGE_KEY = 'FAVORITE_LIST') {
  const songList = ref([])
  const favoriteList = ref([])
  const searching = ref(false)
  const loading = ref(false)
  const loadingRid = ref(null)
  const musicInfo = reactive({
    rid: null,
    name: null,
    artist: null,
    pic: 'http://p2.music.126.net/KK2fyHMit2saFMMMDUfJ3w==/109951164249516600.jpg',
    url: null,
    lrc: null,
    volume: 0.5,
    duration: 0,
    currentTime: 0,
    isPaused: true,
    isMuted: false,
    preload: 0
  })
  const timeProgress = computed(() => {
    if (musicInfo.duration && musicInfo.currentTime) {
      return musicInfo.currentTime / musicInfo.duration
    }
    return 0
  })
  function searchList(searchForm = {}) {
    if (searching.value) return
    const searchParams = { ...searchForm }
    if (searchParams.type === 'search') {
      if (!searchParams.keyword) {
        delete searchParams.type
        delete searchParams.keyword
      }
    }
    searching.value = true
    getSongList(searchParams)
      .then((res) => {
        songList.value = res.data
        if (!musicInfo.rid && songList.value[0]) {
          changeSong(songList.value[0])
        }
      })
      .finally(() => {
        searching.value = false
      })
  }
  function changeSong(song) {
    loadingRid.value = song.rid
    loading.value = true
    return new Promise((resolve, reject) => {
      if (song.rid === musicInfo.rid) {
        loadingRid.value = null
        loading.value = false
        resolve()
        return
      }
      getSongInfo(song.rid)
        .then((res) => {
          const data = res.data
          musicInfo.rid = song.rid
          musicInfo.name = song.name
          musicInfo.artist = song.artist
          musicInfo.pic = song.pic
          musicInfo.lrc = data.lrc
          musicInfo.url = data.url
          loadingRid.value = null
          loading.value = false
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: musicInfo.name,
              artist: musicInfo.artist,
              album: musicInfo.name,
              artwork: [{ src: song.pic, sizes: '256x256', type: 'image/jpg' }]
            })
          }
          resolve()
        })
        .catch((err) => {
          loading.value = false
          loadingRid.value = null
          console.log(err)
          reject()
        })
    })
  }
  function togglePlay() {
    if (audioRef.value.paused) {
      audioRef.value.play()
    } else {
      audioRef.value.pause()
    }
  }
  function playSong(song) {
    if (loading.value) return
    changeSong(song).then(() => {
      audioRef.value.play()
    })
  }
  function playPrev() {
    const index = songList.value.findIndex((item) => item.rid === musicInfo.rid)
    if (index !== -1 && index !== 0) {
      const prevSong = songList.value[index - 1]
      if (prevSong) {
        playSong({ ...prevSong })
      }
    }
  }
  function playNext() {
    const len = songList.value.length
    const index = songList.value.findIndex((item) => item.rid === musicInfo.rid)
    let nextIndex = index + 1
    nextIndex = nextIndex >= 0 && nextIndex < len ? nextIndex : 0
    const nextSong = songList.value[nextIndex]
    if (nextSong) {
      playSong({ ...nextSong })
    }
  }
  function handleChangeVolume(progress) {
    audioRef.value.volume = progress
  }
  function handleTimeChange(progress) {
    audioRef.value.currentTime = musicInfo.duration * progress
  }
  function toggleMuted() {
    audioRef.value.muted = !audioRef.value.muted
  }
  function isFavorite(id) {
    return favoriteList.value.some((item) => item.rid === id)
  }
  function toggleFavorite(song) {
    const index = favoriteList.value.findIndex((item) => item.rid === song.rid)
    if (index === -1) {
      const songItem = {
        rid: song.rid,
        name: song.name,
        artist: song.artist,
        pic: song.pic
      }
      favoriteList.value.push({ ...songItem })
    } else {
      favoriteList.value.splice(index, 1)
    }
    const favoriteListJson = JSON.stringify(favoriteList.value)
    localStorage.setItem(STORAGE_KEY, favoriteListJson)
  }
  function handleFavoriteList() {
    songList.value = [...favoriteList.value]
  }
  onMounted(() => {
    const favoriteListJson = localStorage.getItem(STORAGE_KEY) || '[]'
    favoriteList.value = JSON.parse(favoriteListJson)
    audioRef.value.volume = musicInfo.volume
    audioRef.value.ontimeupdate = (e) => {
      musicInfo.currentTime = e.target.currentTime
    }
    audioRef.value.onloadedmetadata = (e) => {
      musicInfo.preload = 0
      musicInfo.currentTime = 0
      musicInfo.duration = e.target.duration
    }
    audioRef.value.onpause = () => {
      musicInfo.isPaused = true
    }
    audioRef.value.onplay = () => {
      musicInfo.isPaused = false
    }
    // 播放结束
    audioRef.value.onended = () => {
      playNext()
    }
    audioRef.value.onerror = (e) => {
      console.error(e)
    }
    audioRef.value.onvolumechange = (e) => {
      musicInfo.volume = e.target.volume
      musicInfo.isMuted = e.target.muted
    }
    audioRef.value.onprogress = (e) => {
      const target = e.target
      if (target.buffered.length > 0) {
        const bufferedEnd = target.buffered.end(target.buffered.length - 1)
        musicInfo.preload = bufferedEnd / target.duration
      }
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrev()
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext()
      })
    }
  })
  return {
    musicInfo,
    timeProgress,
    songList,
    searching,
    searchList,
    loading,
    loadingRid,
    favoriteList,
    isFavorite,
    toggleFavorite,
    handleFavoriteList,
    togglePlay,
    playSong,
    playPrev,
    playNext,
    handleChangeVolume,
    handleTimeChange,
    toggleMuted
  }
}
