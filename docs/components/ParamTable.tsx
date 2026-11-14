import React from 'react';
import { useLang } from '@rspress/core/runtime';

export interface ParamRow {
  name: string;
  type: string;
  defaultValue?: string;
  descriptionZh: string;
  descriptionEn: string;
}

export interface ParamTableProps {
  rows: ParamRow[];
  firstColumnLabel?: string;
}

export function ParamTable({ rows, firstColumnLabel }: ParamTableProps) {
  const lang = useLang();
  const isEn = lang === 'en';

  return (
    <div style={{ overflowX: 'auto', margin: '14px 0 24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>
              {firstColumnLabel ?? (isEn ? 'Option / Token' : '参数 / 变量名')}
            </th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>
              {isEn ? 'Type / Value' : '类型 / 默认范围'}
            </th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>
              {isEn ? 'Default' : '默认值'}
            </th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>
              {isEn ? 'Description' : '说明'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                <code>{row.name}</code>
              </td>
              <td style={{ padding: '9px 12px' }}>
                <code>{row.type}</code>
              </td>
              <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                {row.defaultValue ? <code>{row.defaultValue}</code> : '—'}
              </td>
              <td style={{ padding: '9px 12px', lineHeight: 1.55 }}>
                {isEn ? row.descriptionEn : row.descriptionZh}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
