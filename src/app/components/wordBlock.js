import { useState, useEffect } from 'react';
import styles from './WordBlock.module.scss'
import WordLetter from './wordLetter';

function WordBlock(props) {
  const { word, user, color, answer, updateLetterStatus } = props;
  const [getStatusArray, setStatusArray] = useState(Array(word.length).fill(0));
  const answerLetterArray = answer.split('');
  const wordLetterArray = word.split('');

  const hexToRGB = (hexCode) => {
    hexCode = hexCode.replace('#', '');
    const r = parseInt(hexCode.substring(0, 2), 16);
    const g = parseInt(hexCode.substring(2, 4), 16);
    const b = parseInt(hexCode.substring(4, 6), 16);
    return [r, g, b];
  }

  function rgbToLuminance(rgb) {
    const [r, g, b] = rgb.map(val => val / 255);
    const rLinear = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
  
  function contrastRatio(color1, color2) {
    const luminance1 = rgbToLuminance(color1);
    const luminance2 = rgbToLuminance(color2);
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  const adjustConstrast = (hexCode) => {
    const background = hexToRGB('#18181b');
    const color = hexToRGB(hexCode);

    const currentContrast = contrastRatio(color, background);
    if (currentContrast >= 4.5) {
      return hexCode; // Color already has adequate contrast
    }

    // Increase brightness of the color until contrast is met
    let adjustedColor = [...color];
    while (contrastRatio(adjustedColor, background) < 4.5) {
      for (let i = 0; i < 3; i++) {
        adjustedColor[i] = Math.min(255, adjustedColor[i] + 10);
      }
    }

    return `#${adjustedColor.map(val => val.toString(16).padStart(2, '0')).join('')}`;
  }

  const initStatusArray = () => {
    let tempArray = Array(word.length).fill(0);
    let answerCheckArray = [...answerLetterArray];

    //Loop through the letters and check their status
    for (let i = 0; i < wordLetterArray.length; i++) {
      // Correct if correct letter is in correct space
      if (wordLetterArray[i] === answerCheckArray[i]) {
        tempArray[i] = 2;
        answerCheckArray[i] = '-'; //Prevent further checks from counting this found letter
      }
      else {
        let letterFound = false;
        //Check other letters in answer
        for (let j = 0; j < answerCheckArray.length && !letterFound; j++) {
          if (wordLetterArray[i] === answerCheckArray[j]) {
            tempArray[i] = 1;
            answerCheckArray[j] = '-';
            letterFound = true;
          }
        }
      }

    }
    setStatusArray([...tempArray]);

    //send letter data to game component to update keybaord
    let tempObject = {};
    for (let i = 0; i < wordLetterArray.length; i++) {
      if (!tempObject[wordLetterArray[i]] || tempObject[wordLetterArray[i]] < tempArray[i]) {
        tempObject[wordLetterArray[i]] = tempArray[i];
      }
    }
    updateLetterStatus(tempObject);
  }

  useEffect(() => {
    initStatusArray();
  }, []);

  return (
    <div className={styles.block}>
      <span className={styles.user} style={{ color: adjustConstrast(color) }}>
        {user.length <= 10 ? user : user.slice(0, 7) + '...'}
      </span>
      <div className={styles.word}>
        {wordLetterArray.map((letter, index) => (
          <WordLetter key={index} letter={letter} status={getStatusArray[index]} />
        ))}
      </div>
    </div>
  );
}

export default WordBlock;
