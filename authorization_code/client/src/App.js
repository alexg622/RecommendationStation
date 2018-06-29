
import React, { Component } from 'react';
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(){
    super();
    let token = null
    const params = this.getHashParams();
    token = params.access_token;
    console.log(token);
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' },
      token: token,
      playLists: [],
      search: "",
      searchOutPut: "",
      playListName: "",
      userId: ""
    }
    this.getPlayBackState = this.getPlayBackState.bind(this)
    this.playIt = this.playIt.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.update = this.update.bind(this)
    this.showAlbums = this.showAlbums.bind(this)
    this.playAlbum = this.playAlbum.bind(this)
    this.updatePlayListName = this.updatePlayListName.bind(this)
    this.handlePlayListSubmit = this.handlePlayListSubmit.bind(this)
    this.marginIt = this.marginIt.bind(this)
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  componentDidMount(){
    spotifyApi.getUserPlaylists()
      .then(data => {
        let playLists = data.items.map(item => item)
        this.setState({playLists: playLists})
      }, function(err) {
        this.setState({loggedIn: false})
    });

    console.log(this.state.loggedIn);

    spotifyApi.getMe().then(data => {
      console.log(data);
      this.setState({userId: data.id})
    })

  }




  getPlayBackState(){
    // get users id for playlists
    spotifyApi.getMe()
      .then(data => {
        this.setState({
          userId: data.id
        })
      }, function(err) {
        console.log('Something went wrong!', err);
    });
  }

  playIt(e){
    let uri = this.state.playLists[e.target.id].uri
    let iFrame = document.getElementById("important")
    iFrame.src = iFrame.src.substring(0, 35) + uri
  }

  marginIt(e){
    console.log(e.target.value);
    // document.getElementById("login").innerText = "Reset Auth Token"
    document.getElementById("login").remove();
    document.querySelector(".logo-div").style.marginRight = "130px"
  }


  login(){
    if (this.state.loggedIn === false && document.getElementById("margin-change") !== null){
      return <a onClick={this.marginIt} id="login" href='http://localhost:8888' > Login to Spotify </a>
    }
  }

  playListNames(){
    let names
    let counter = 0
    if(this.state.playLists.length > 0) {
      names = this.state.playLists.map(playlist => {
          counter += 1
          return <div id={counter-1} key={playlist.id} className='playlist-name' onClick={this.playIt}>{playlist.name}</div>
      })
    }
    return names
  }

  handleSubmit(e){
    spotifyApi.searchArtists(e.target.firstElementChild.value)
      .then(data => {
        if (data.artists.items[0] !== undefined) {
          spotifyApi.getArtistAlbums(data.artists.items[0].id)
          .then(data => {
            console.log("this is the search output data", data);
            this.setState({searchOutPut: data})
          }, function(err) {
            console.error(err);
          });
        }
      })
      this.setState({search: ""})
      console.log(this.state.searchOutPut);
  }

  update(e){
    this.setState({search: e.target.value})
  }

  showAlbums(){
    let counter = 0
    let albums
    if(this.state.searchOutPut !== "") {
      albums = this.state.searchOutPut.items.map(album => {
        counter += 1
          return (
            <div onClick={this.playAlbum} key={album.id} id={counter-1} className="album-div">
              <img id={counter-1} className="album-image" key={album.id+1} style={{width: "200px", height: "200px"}} src={album.images[0].url}/>
              <div className="center-album-text" key={album.id+3}>
                <div id={counter} className="album-title" key={album.id+2}>{album.name}</div>
              </div>
            </div>
          )
      })
    }
    return albums
  }

  playAlbum (e){
    let uri = this.state.searchOutPut.items[e.target.id].uri
    let iFrame = document.getElementById("important")
    iFrame.src = iFrame.src.substring(0, 35) + uri
  }

  updatePlayListName(e){
    this.setState({playListName: e.target.value})
  }

  handlePlayListSubmit(e){
    console.log(this.state.userId);
    console.log(e.target.firstElementChild.value);
    spotifyApi.createPlaylist(this.state.userId, e.target.firstElementChild.value, { 'public' : false })
      .then(function(data) {
        console.log('Created playlist!');
      }, function(err) {
        console.log('Something went wrong!', err);
      });
      this.setState({playListName: ""})
  }

  render() {
    return (
      <div className="App">
        <div className="navbar">

          <div id="margin-change" className="logo-div">
            <h1 className='logo'>RecommendationStation</h1>
          </div>
          return <a onClick={this.marginIt} id="login" href='http://localhost:8888' > Login to Spotify </a>
        </div>
        <div className="body">
          <div className="select-column">
            <h1 className="playlists">Playlists</h1>
            {this.playListNames()}
          </div>
          <div className="Input-div">
            <form onSubmit={this.handleSubmit}>
              <input className="search-songs" placeholder="Search for Albums by Artists" value={this.state.search} onChange={this.update}/>
            </form>
            <form onSubmit={this.handlePlayListSubmit}>
              <input className="search-songs" placeholder="Create your playlist" value={this.state.playListName} onChange={this.updatePlayListName}/>
            </form>
          </div>
          <iframe id="important" className='music-player' src="https://open.spotify.com/embed?uri=spotify:user:317phsnhlzyrdwlfiflnu52nnei4:playlist:6Yvi4xOyjbfWmt41ydm2q1" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        </div>
        <div className="second-body">
          {this.showAlbums()}
        </div>
      </div>
    );
  }
}

export default App;
