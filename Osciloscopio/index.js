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
} from '@shopify/react-native-skia';

import {Dimensions, Text} from 'react-native';

const ancho_pantalla = Dimensions.get('screen').width;
const alto_pantalla = Dimensions.get('screen').height;

const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setBlendMode(BlendMode.Multiply);
const font_size = 8;

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
  escala_x = 0.5,
}) => {
  const font = useFont(require('./Fonts/Lato-Regular.ttf'), font_size);

  const stroke = useMemo(() => {
    const stroke = paint.copy();
    stroke.setStrokeWidth(1);
    stroke.setStrokeMiter(1);
    stroke.setStyle(PaintStyle.Stroke);
    stroke.setStrokeCap(StrokeCap.Round);
    stroke.setStrokeJoin(StrokeJoin.Round);
    stroke.setColor(Skia.Color(color_ejes));
    return stroke;
  }, [color_ejes]);

  const stroke_linea = useMemo(() => {
    const stroke_linea = paint.copy();
    stroke_linea.setColor(Skia.Color(color_linea));
    stroke_linea.setStyle(PaintStyle.Stroke);
    stroke_linea.setStrokeJoin(StrokeJoin.Miter);
    stroke_linea.setStrokeWidth(1);
    return stroke_linea;
  }, [color_linea]);

  const stroke_linea_clara = useMemo(() => {
    const stroke_linea = paint.copy();
    stroke_linea.setColor(Skia.Color(color_linea + '80'));
    stroke_linea.setStyle(PaintStyle.Stroke);
    stroke_linea.setStrokeJoin(StrokeJoin.Miter);
    stroke_linea.setStrokeWidth(1);
    return stroke_linea;
  }, [color_linea]);

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

  const dibujarLineas = canvas => {
    for (let linea of lineas) {
      if (
        linea.current.length * escala_x >
        ancho_grafica - padding_vertical * 2
      ) {
        linea.current = linea.current.splice(1);
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
      dibujarLineas(canvas);
      dibujarEjes(canvas);
      dibujarDivisionesEnY(canvas);
    },
    [font],
  );

  if (!font) {
    return <Text>Font no found!</Text>;
  }

  return (
    <SkiaView
      mode="continuous"
      style={{width: ancho_grafica, height: alto_grafica}}
      onDraw={onDraw}
    />
  );
};

export default Osciloscopio;
