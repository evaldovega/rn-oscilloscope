import React, {useEffect, useMemo, useRef} from 'react';
import {
  Skia,
  SkiaView,
  BlendMode,
  useDrawCallback,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
  useFont,
  useValue,
  rrect,
  rect,
} from '@shopify/react-native-skia';

import {Dimensions, Text, useColorScheme} from 'react-native';
import {assertTSExpressionWithTypeArguments} from '../../../../AppData/Local/Microsoft/TypeScript/4.8/node_modules/@babel/types/lib/index';

const ancho_pantalla = Dimensions.get('screen').width;
const alto_pantalla = Dimensions.get('screen').height;

const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setBlendMode(BlendMode.Multiply);
const font_size = 8;

console.log(rect(0, 0, 100, 100));

const Osciloscopio = ({
  lineas = [],
  ancho_grafica = ancho_pantalla,
  alto_grafica = alto_pantalla * 0.4,
  padding_horizontal = 42,
  padding_vertical = 30,
  y_min = -1,
  y_max = 1,
  color_ejes = '#A3A3A3',
  color_linea = '#59BBAB',
}) => {
  const theme = useColorScheme();
  const font = useFont(require('./Fonts/Lato-Regular.ttf'), font_size);
  //50ms
  const velocidad_desplazamiento = useValue(5);
  const puntos_eliminados = useValue(0);

  const frecuencia = 10;
  const divisiones_x = 4;
  const ancho_segundo = (ancho_grafica - padding_horizontal) / divisiones_x;
  const escala_x = ancho_segundo / (1000 / frecuencia);

  const stroke = useMemo(() => {
    const stroke = paint.copy();
    stroke.setStrokeWidth(1);
    stroke.setStrokeMiter(1);
    stroke.setStyle(PaintStyle.Stroke);
    stroke.setStrokeCap(StrokeCap.Round);
    stroke.setStrokeJoin(StrokeJoin.Round);
    stroke.setColor(Skia.Color(color_ejes));
    return stroke;
  }, [color_ejes, theme]);

  const stroke_bg = useMemo(() => {
    const stroke_linea = paint.copy();
    stroke_linea.setColor(Skia.Color(color_linea));
    stroke_linea.setStyle(PaintStyle.Stroke);
    stroke_linea.setStrokeJoin(StrokeJoin.Miter);
    stroke_linea.setStrokeWidth(2);
    return stroke_linea;
  }, [color_linea, theme]);

  const stroke_linea = useMemo(() => {
    const stroke_linea = paint.copy();
    stroke_linea.setColor(Skia.Color(color_linea));
    stroke_linea.setStyle(PaintStyle.Stroke);
    stroke_linea.setStrokeJoin(StrokeJoin.Miter);
    stroke_linea.setStrokeWidth(2);
    return stroke_linea;
  }, [color_linea, theme]);

  const stroke_linea_clara = useMemo(() => {
    const color = theme == 'dark' ? 'white' : color_linea + '80';

    const stroke_linea = paint.copy();
    stroke_linea.setColor(Skia.Color(color));
    stroke_linea.setStyle(PaintStyle.Stroke);
    stroke_linea.setStrokeJoin(StrokeJoin.Miter);
    stroke_linea.setStrokeWidth(1);
    return stroke_linea;
  }, [color_linea, theme]);

  const bg = useMemo(() => {
    const bg = paint.copy();
    const color = theme == 'dark' ? '#566573' : '#FDFEFE';
    bg.setStyle(PaintStyle.Fill);
    bg.setColor(Skia.Color(color));
    return bg;
  }, [theme]);

  const dibujarEjes = canvas => {
    const eje_y = Skia.Path.Make();
    eje_y.moveTo(padding_horizontal, padding_vertical);
    eje_y.lineTo(padding_horizontal, alto_grafica - padding_vertical * 2);
    const eje_x = Skia.Path.Make();
    eje_x.moveTo(padding_horizontal, alto_grafica - padding_vertical * 2);
    eje_x.lineTo(
      ancho_pantalla - padding_horizontal,
      alto_grafica - padding_vertical * 2,
    );
    canvas.drawPath(eje_y, stroke);
    canvas.drawPath(eje_x, stroke);
  };

  const dibujarDivisionesEnY = canvas => {
    const altura_division = (alto_grafica - padding_vertical) / 5;
    canvas.drawText(
      y_max.toString(),
      padding_horizontal / 2,
      padding_vertical + 4,
      stroke,
      font,
    );
    canvas.drawText(
      y_min.toString(),
      padding_horizontal / 2,
      alto_grafica - padding_vertical * 2,
      stroke,
      font,
    );
    for (let y = 1; y < 4; y++) {
      const division = Skia.Path.Make();
      const valor = interpolar(y, 0, 1, 4, -1);
      const division_y = y * altura_division + padding_vertical;
      division.moveTo(padding_horizontal - 5, division_y);
      division.lineTo(padding_horizontal + 5, division_y);
      const text = valor.toFixed(1);
      const ancho_texto = font.getMetrics(text).bounds.width / 2;
      canvas.drawText(
        text,
        padding_horizontal / 2 - ancho_texto - 2.5,
        division_y + 2,
        stroke,
        font,
      );
      canvas.drawPath(division, stroke_linea);
      const linea_horizontal = Skia.Path.Make();
      linea_horizontal.moveTo(padding_horizontal + 5, division_y);
      linea_horizontal.lineTo(ancho_pantalla - padding_horizontal, division_y);
      canvas.drawPath(linea_horizontal, stroke_linea_clara);
    }
  };

  const dibujarDivisionesEnX = canvas => {
    const y = alto_grafica + padding_vertical * 2;
    const total_divisiones =
      Math.round(lineas[0].current.length / divisiones_x) * frecuencia;

    for (let i = 1; i < total_divisiones; i++) {
      const division = Skia.Path.Make();
      const x = i * ancho_segundo + puntos_eliminados.current * escala_x;
      if (x < padding_horizontal) {
        continue;
      }
      if (x > ancho_grafica) {
        break;
      }
      const y = alto_grafica - padding_vertical * 2;
      division.moveTo(x, y - 5);
      division.lineTo(x, y + 5);
      canvas.drawPath(division, stroke_linea);
      canvas.drawText(i.toFixed(0) + 's', x - 2, y + 15, stroke, font);
      const linea_vertical = Skia.Path.Make();
      linea_vertical.moveTo(x, padding_vertical);
      linea_vertical.lineTo(x, y);
      canvas.drawPath(linea_vertical, stroke_linea_clara);
    }
  };

  const dibujarLineas = canvas => {
    for (let linea of lineas) {
      if (
        linea.current.length * escala_x >
        ancho_grafica - padding_vertical * 2
      ) {
        linea.current = linea.current.splice(velocidad_desplazamiento.current);
        puntos_eliminados.current -= velocidad_desplazamiento.current;
      }

      const line = Skia.Path.Make();

      for (let [i, punto] of linea.current.entries()) {
        const x = padding_horizontal + i * escala_x;

        if (x + padding_horizontal > ancho_grafica) {
          break;
        }
        const y = interpolar(
          punto.y,
          y_min,
          padding_vertical,
          y_max,
          alto_grafica - padding_vertical * 2 - 2,
        );
        if (i == 0) {
          line.moveTo(x, y);
        } else {
          line.lineTo(x, y);
        }
      }
      canvas.drawPath(line, stroke_linea);
    }
  };

  const onDraw = useDrawCallback(
    canvas => {
      canvas.save();
      canvas.drawRect(rect(0, 0, ancho_grafica, alto_grafica), bg);
      dibujarLineas(canvas);
      dibujarEjes(canvas);
      dibujarDivisionesEnY(canvas);
      dibujarDivisionesEnX(canvas);
      canvas.restore();
    },
    [font, theme],
  );

  useEffect(() => {
    puntos_eliminados.current = 0;
    lineas.forEach(linea => {
      linea.current = [];
    });
  });

  if (!font) {
    return <Text>Font no found!</Text>;
  }

  return (
    <SkiaView
      mode="continuous"
      style={{
        width: ancho_grafica,
        height: alto_grafica,
      }}
      onDraw={onDraw}
    />
  );
};

export const interpolar = (
  valor_a_calcular,
  rango_inferior,
  valor_rango_inferior,
  rango_superiror,
  valor_rango_superior,
) => {
  return (
    ((valor_a_calcular - rango_inferior) *
      (valor_rango_superior - valor_rango_inferior)) /
      (rango_superiror - rango_inferior) +
    valor_rango_inferior
  );
};

function invertColor(hex, bw) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}
export default Osciloscopio;
