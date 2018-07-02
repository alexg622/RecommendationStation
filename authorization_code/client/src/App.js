import React, { Component } from "react";
import "./App.css";
import Carousel from "./carousel";

import SpotifyWebApi from "spotify-web-api-js";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    let token = null;
    const params = this.getHashParams();
    token = params.access_token;
    // console.log(token);
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: "Not Checked", albumArt: "" },
      token: token,
      playLists: [],
      allCategories: [],
      allCategoriesNames: [],
      fetchedPlaylists: [],
      search: "",
      searchOutPut: "",
      playListName: "",
      userId: "",
      carouselTitle: "",
      artistIds: [] // Used for fetching recommendations
    };
    this.getPlayBackState = this.getPlayBackState.bind(this);
    this.playIt = this.playIt.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update = this.update.bind(this);
    // this.showAlbums = this.showAlbums.bind(this);
    // this.playAlbum = this.playAlbum.bind(this);
    this.updatePlayListName = this.updatePlayListName.bind(this);
    this.handlePlayListSubmit = this.handlePlayListSubmit.bind(this);
    this.marginIt = this.marginIt.bind(this);
    this.makeRecommendation = this.makeRecommendation.bind(this);
    this.getRandomPlaylist = this.getRandomPlaylist.bind(this);
  }
  getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  componentDidMount() {
    spotifyApi.getUserPlaylists().then(
      data => {
        let playLists = data.items.map(item => item);
        this.setState({ playLists: playLists });
      },
      function(err) {
        // this.setState({ loggedIn: false });
      }
    );

    spotifyApi.getMe().then(data => {
      this.setState({ userId: data.id });
    });

    // Grab all playlist categories
    spotifyApi.getCategories({ limit: 50 }).then(data => {
      // console.log(data);
      let allCats = data.categories.items.map(item => item.id);
      let allCatNames = data.categories.items.map(item => item.name);
      this.setState({ allCategories: allCats });
      this.setState({ allCategoriesNames: allCatNames });
    });
  }

  getPlayBackState() {
    // get users id for playlists
    spotifyApi.getMe().then(
      data => {
        this.setState({
          userId: data.id
        });
      },
      function(err) {
        console.log("Something went wrong!", err);
      }
    );
  }

  playIt(e, newTarget) {
    let uri;
    if (newTarget !== undefined) {
      uri = newTarget.uri;
      // this.setState({ fetchedPlaylists: this.state.playLists });
    } else {
      uri = this.state.playLists[e.target.id].uri;
      this.setState({ fetchedPlaylists: this.state.playLists });
      this.setState({ carouselTitle: "Your Playlists" });
    }
    let iFrame = document.getElementById("important");
    iFrame.src = iFrame.src.substring(0, 35) + uri;
  }

  marginIt(e) {
    // console.log(e.target.value);
    // document.getElementById("login").innerText = "Reset Auth Token"
    document.getElementById("login").remove();
    document.querySelector(".logo-div").style.marginRight = "130px";
  }

  login() {
    if (
      this.state.loggedIn === false &&
      document.getElementById("margin-change") !== null
    ) {
      return (
        <a onClick={this.marginIt} id="login" href="http://localhost:8888">
          {" "}
          Login to Spotify{" "}
        </a>
      );
    }
  }

  playListNames() {
    let names;
    let counter = 0;
    if (this.state.playLists.length > 0) {
      names = this.state.playLists.map(playlist => {
        counter += 1;
        return (
          <div
            id={counter - 1}
            key={playlist.id}
            className="playlist-name"
            onClick={this.playIt}
          >
            {playlist.name}
          </div>
        );
      });
    }
    return names;
  }

  handleSubmit(e) {
    spotifyApi.searchArtists(e.target.firstElementChild.value).then(data => {
      if (data.artists.items[0] !== undefined) {
        spotifyApi.getArtistAlbums(data.artists.items[0].id).then(
          data => {
            console.log("this is the search output data", data);
            this.setState({ fetchedPlaylists: data.items });
            this.setState({ carouselTitle: data.items[0].artists[0].name });
          },
          function(err) {
            console.error(err);
          }
        );
      }
    });
    this.setState({ search: "" });
    // console.log(this.state.searchOutPut);
  }

  update(e) {
    this.setState({ search: e.target.value });
  }

  // showAlbums() {
  //   let counter = 0;
  //   let albums;
  //   if (this.state.searchOutPut !== "") {
  //     albums = this.state.searchOutPut.items.map(album => {
  //       counter += 1;
  //       return (
  //         <div
  //           onClick={this.playAlbum}
  //           key={album.id}
  //           id={counter - 1}
  //           className="album-div"
  //         >
  //           <img
  //             id={counter - 1}
  //             className="album-image"
  //             key={album.id + 1}
  //             style={{ width: "200px", height: "200px" }}
  //             src={album.images[0].url}
  //           />
  //           <div className="center-album-text" key={album.id + 3}>
  //             <div id={counter} className="album-title" key={album.id + 2}>
  //               {album.name}
  //             </div>
  //           </div>
  //         </div>
  //       );
  //     });
  //   }
  //   return albums;
  // }

  // playAlbum(e) {
  //   let uri = this.state.searchOutPut.items[e.target.id].uri;
  //   let iFrame = document.getElementById("important");
  //   iFrame.src = iFrame.src.substring(0, 35) + uri;
  // }

  updatePlayListName(e) {
    this.setState({ playListName: e.target.value });
  }

  handlePlayListSubmit(e) {
    spotifyApi
      .createPlaylist(this.state.userId, e.target.firstElementChild.value, {
        public: false
      })
      .then(
        function(data) {
          console.log("Created playlist!");
        },
        function(err) {
          console.log("Something went wrong!", err);
        }
      );
    this.setState({ playListName: "" });
  }

  getRandomPlaylist(e) {
    let allCats = this.state.allCategories;
    let allCatNames = this.state.allCategoriesNames;
    let length = allCats.length;
    let randomNum = Math.floor(Math.random() * length);
    // Get the title of the list of Playlists and save to State
    this.setState({ carouselTitle: allCatNames[randomNum] });
    // console.log(allCatNames[randomNum]);
    spotifyApi.getCategoryPlaylists(allCats[randomNum], { limit: 50 }).then(
      data => {
        // Puts all the playlists in the carousel
        this.setState({ fetchedPlaylists: data.playlists.items });
        // Puts a random playlist into the player widget
        let randomPlaylist =
          data.playlists.items[
            Math.floor(Math.random() * data.playlists.items.length)
          ];

        let uri = randomPlaylist.uri;
        let iFrame = document.getElementById("important");
        iFrame.src = iFrame.src.substring(0, 35) + uri;
      },
      function(err) {
        console.log("Something went wrong!", err);
      }
    );
  }
  makeRecommendation(e) {
    let ownerId
    let playlistId
    // GRAB ALL USER PLAYLISTS
    let allPlaylists = this.state.playLists;
    let length = allPlaylists.length;
    let randomNum = Math.floor(Math.random() * length);
    // PICK A RANDOM PLAYLIST FROM THAT LIST OF PLAYLISTS
    let randomUserPlaylist = allPlaylists[randomNum];
    // GET PLAYLIST'S OWNER ID (required for getting the tracks)
    if (randomUserPlaylist !== undefined) {
      ownerId = randomUserPlaylist.owner.id;
    } else {
      ownerId = 1
    }
    // GET PLAYLIST'S ID (required for getting the tracks)
    if (randomUserPlaylist !== undefined) {
     playlistId = randomUserPlaylist.id;
    } else {
      playlistId = 1
    }
    // REQUEST PLAYLIST TRACKS FROM API
    spotifyApi.getPlaylistTracks(ownerId, playlistId).then(
      data => {
        // GET A RANDOM ARTIST ID FROM THE PLAYLIST
        let artistIds = data.items.map(track => track.track.artists[0].id);
        this.setState({ artistIds: artistIds });
        let randomArtistId =
          artistIds[Math.floor(Math.random() * artistIds.length)];
        // USE RANDOM ARTIST ID TO FETCH RELATED ARTIST FROM API
        spotifyApi.getArtistRelatedArtists(randomArtistId).then(
          data => {
            // GET A RANDOM RELATED ARTIST
            let relatedArtists = data.artists;
            let randomRelatedArtist =
              relatedArtists[Math.floor(Math.random() * relatedArtists.length)];
            let randomRelatedArtistId = randomRelatedArtist.id;
            // USER RANDOM RELATED ARTIST ID TO FETCH ALBUMS FROM API
            spotifyApi.getArtistAlbums(randomRelatedArtistId).then(
              data => {
                // POPULATE CAROUSEL WITH RELATED ARTIST'S ALBUMS
                this.setState({ fetchedPlaylists: data.items });

                // PICK ONE RANDOM ABLUM
                let randomNum = Math.floor(Math.random() * data.items.length);
                let randomAlbum = data.items[randomNum];
                // SET CAROUSEL TITLE TO ARTIST's NAME
                this.setState({ carouselTitle: randomAlbum.artists[0].name });
                // MOUNT ALBUM TO PLAYER
                let uri = randomAlbum.uri;
                let iFrame = document.getElementById("important");
                iFrame.src = iFrame.src.substring(0, 35) + uri;
              },
              function(err) {
                console.log("Something went wrong!", err);
              }
            );
          },
          function(err) {
            console.log("Something went wrong!", err);
          }
        );
      },
      function(err) {
        console.log("Something went wrong!", err);
      }
    );
  }

  render() {
    return (
      <div className="App">
        <div className="navbar">
          <div className="top-left-div">
            <h1 className="logo" />
          </div>
          <div id="margin-change" className="logo-div">
            <h1 className="logo">RecommendationStation</h1>
          </div>
          {/*return{" "}*/}
          <a onClick={this.marginIt} id="login" href="http://localhost:8888">
            {/* {" "} */}
            Login to Spotify
          </a>
        </div>
        <div className="body">
          <div className="select-column">
            <h1 className="playlists">Your Playlists</h1>
            {this.playListNames()}
          </div>
          <div className="Input-div">
            <form onSubmit={this.handleSubmit}>
              <input
                className="search-songs"
                placeholder="Search for Albums by Artists"
                value={this.state.search}
                onChange={this.update}
              />
            </form>

            {/*
              Testing
            */}
            <form onClick={this.makeRecommendation}>
              <button
                className="recommend-button"
                value={this.state.playListName}
                onChange={this.updatePlayListName}
              >
                Make Recommendation
              </button>
            </form>
            <form onClick={this.getRandomPlaylist}>
              <button
                className="random-button"
                value={this.state.playListName}
                onChange={this.updatePlayListName}
              >
                Give Me A Random Playlist
              </button>
            </form>
            {/*
              Testing
            */}
          </div>

          <iframe
            id="important"
            className="music-player"
            src="https://open.spotify.com/embed?uri=spotify:user:317phsnhlzyrdwlfiflnu52nnei4:playlist:6Yvi4xOyjbfWmt41ydm2q1"
            width="300"
            height="380"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          />
        </div>

        <div>
          <Carousel
            className="carousel-container"
            title={this.state.carouselTitle}
            playlists={this.state.fetchedPlaylists}
            playIt={this.playIt}
          />
        </div>
      </div>
    );
  }
}

export default App;
