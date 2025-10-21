/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { GraphicRenderer } from './graphics';

interface HalResponseRendererProps {
  message: string;
  isError: boolean;
}

const HalResponseRenderer: React.FC<HalResponseRendererProps> = ({ message, isError }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (message) {
      setDisplayedText(''); // Reset on new message
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < message.length) {
          setDisplayedText(message.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 15);

      return () => clearInterval(intervalId);
    }
  }, [message]);

  const isFinishedTyping = message ? displayedText.length === message.length : false;
  const textColor = isError ? 'text-red-400' : 'text-slate-200';

  const parts = displayedText.split(/(<graphic type=".*?"\/>)/g).filter(part => part);
  const graphicTagRegex = /<graphic type="(.*?)"\/>/;

  return (
    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${textColor}`}>
      {parts.map((part, index) => {
        const match = part.match(graphicTagRegex);
        if (match) {
          const type = match[1];
          return <GraphicRenderer key={index} type={type} />;
        }
        return <span key={index}>{part}</span>;
      })}
      {!isFinishedTyping && <span className="animate-blink">_</span>}
    </p>
  );
};

export default HalResponseRenderer;