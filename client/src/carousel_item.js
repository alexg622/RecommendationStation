import React, { Component } from "react";
import "./carousel.css";

class CarouselItem extends Component {
  render() {
    const { playlist } = this.props;

    if (playlist.length === 0) {
      return <div className="tile" />;
    }

    return (
      <div
        className="tile"
        onClick={e => this.props.playIt(e, this.props.playlist)}
      >
        <div className="tile__media">
          <img className="tile__img" src={playlist.images[0].url} alt="" />
        </div>
        <div className="tile__details">
          <div className="tile__title">{playlist.name}</div>
        </div>
      </div>
    );
  }
}

export default CarouselItem;
