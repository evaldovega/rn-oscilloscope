import React, {useEffect, useRef} from 'react';
import {TextInput, View, Dimensions} from 'react-native';
import Osciloscopio, {interpolar} from './Osciloscopio/index';
import {
  Canvas,
  Circle,
  useTouchHandler,
  useValue,
  Box,
  rrect,
  rect,
} from '@shopify/react-native-skia';
const ancho_pantalla = Dimensions.get('screen').width;

const App = () => {
  const intervalo = useRef(null);
  const data_ble = useRef([]);
  const data_ble_time = useRef(0);
  const data_ble_2 = useRef([]);
  const radians = useRef(0.0);

  const cx = useValue(0);
  const cy = useValue(0);

  const touchHandler = useTouchHandler({
    onActive: ({x, y}) => {
      _y.current = interpolar(x, 0, -1, ancho_pantalla, 1);
      cx.current = x + 16;
      cy.current = y;
    },
  });

  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const _y = useRef(0);

  const simunlarBle = () => {
    //const y = Math.sin(radians.current * Math.PI);
    const y = 0;
    data_ble.current.push({y: _y.current, time: data_ble_time.current});
    data_ble_time.current += 1;

    radians.current += 0.05;
    if (radians.current >= 2.0) {
      radians.current = 0.0;
    }
  };

  useEffect(() => {
    data_ble_time.current = 0;
    data_ble.current = [];
    intervalo.current = setInterval(simunlarBle, 10);

    return () => {
      clearInterval(intervalo.current);
    };
  }, []);

  const lineas = [data_ble];

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Osciloscopio lineas={lineas} escala_x={2} />
      <Canvas
        style={{with: '100%', height: 100, backgroundColor: 'silver'}}
        onTouch={touchHandler}>
        <Circle cx={cx} cy={32} r={32} color="red" />
      </Canvas>
    </View>
  );
};

export default App;
