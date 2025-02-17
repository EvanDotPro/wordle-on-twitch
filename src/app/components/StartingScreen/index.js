import React, { useState } from "react";
import styles from "./StartingScreen.module.scss";

function StartingScreen(props) {
  const { changeChannel, playOffline, isViewMode } = props;
  const [getChannel, setChannel] = useState("");

  const handleInputChange = (event) => {
    setChannel(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  const handleButtonClick = () => {
    changeChannel(getChannel);
  };

  const handleOfflineButtonClick = () => {
    playOffline();
  };

  return (
    <>
      <div className={styles.channelInput}>
        <span className={styles.text}>
          {isViewMode ? "Enter Channel to View:" : "Insert Twitch Channel:"}
        </span>
        <input
          type="text"
          id="userInput"
          name="userInput"
          className={styles.input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        ></input>
        <button className={styles.button} onClick={handleButtonClick}>
          {isViewMode ? "View" : "Connect"}
        </button>
      </div>
      {!isViewMode && (
        <button className={styles.button} onClick={handleOfflineButtonClick}>
          Play Without Connecting
        </button>
      )}
    </>
  );
}

export default StartingScreen;
