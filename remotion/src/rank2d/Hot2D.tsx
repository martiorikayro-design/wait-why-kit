import React from 'react';
import {Rank2D} from './Rank2D';
import {hotTheme} from './themes/hot';
export const Hot2D: React.FC = () => <Rank2D theme={hotTheme} />;
export const HOT2D_DUR = hotTheme.dur;
