import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Osciloscopio from './Osciloscopio/index';

const App = () => {
  const intervalo = useRef(null);
  const data_ble = useRef([]);
  const data_ble_2 = useRef([]);
  const radians = useRef(0.0);

  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const simunlarBle = () => {
    if (data_ble.current.length < 10000) {
      const y = Math.sin(radians.current * Math.PI);
      data_ble.current.push({y});

      const y_aletoria = randomIntFromInterval(-1, 1);
      data_ble_2.current.push({y: y_aletoria});
    }

    radians.current += 0.05;
    if (radians.current >= 2.0) {
      radians.current = 0.0;
    }
  };

  useEffect(() => {
    intervalo.current = setInterval(simunlarBle, 10);

    return () => {
      clearInterval(intervalo.current);
    };
  }, []);

  const lineas = [data_ble];

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Osciloscopio lineas={lineas} escala_x={2} />
    </View>
  );
};

export default App;
