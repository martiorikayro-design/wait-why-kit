import React from 'react';
import {Rank2D} from './Rank2D';
import {coldTheme} from './themes/cold';
export const Cold2D: React.FC = () => <Rank2D theme={coldTheme} />;
export const COLD2D_DUR = coldTheme.dur;
