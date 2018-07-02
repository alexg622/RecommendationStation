import React, { Component } from "react";
import "./carousel.css";
import CarouselItem from "./carousel_item";

class Carousel extends Component {
  // componentWillReceiveProps(newProps) {
  //   console.log("WILL RECEIVE");
  //   console.log(newProps);
  // }
  render() {
    // playlists is an array
    const { playlists } = this.props;

    if (playlists.length === 0) {
      return <div className="contain" />;
    }
    return (
      <div className="contain">
        <h1 className="playlists-genre">{this.props.title}</h1>
        <div className="row">
          <div className="row__inner">
            {playlists.map(playlist => (
              <CarouselItem
                playlist={playlist}
                key={playlist.id}
                id={playlist.id}
                playIt={this.props.playIt}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Carousel;
