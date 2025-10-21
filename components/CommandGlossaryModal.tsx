/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { XMarkIcon } from './icons';

interface Command {
  command: string;
  description: string;
}

interface CommandGlossaryModalProps {
  onClose: () => void;
  onSelectCommand: (command: string) => void;
  commandDictionary: Record<string, Command[]>;
}

const CommandGlossaryModal: React.FC<CommandGlossaryModalProps> = ({ onClose, onSelectCommand, commandDictionary }) => {
  const handleCommandClick = (command: string) => {
    onSelectCommand(command);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 shadow-xl max-w-2xl w-full flex flex-col rounded-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-3 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-200 tracking-widest">// KOMUT_SÖZLÜĞÜ</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors"><XMarkIcon className="w-5 h-5" /></button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {Object.entries(commandDictionary).map(([category, commands]) => (
            <div key={category} className="mb-6">
              <h3 className="text-base font-bold text-blue-400 tracking-wider mb-3">{`// ${category.replace(/_/g, ' ')}`}</h3>
              <div className="space-y-2">
                {Array.isArray(commands) && commands.map((cmd) => (
                  <div key={cmd.command} onClick={() => handleCommandClick(cmd.command)} className="p-2.5 bg-slate-800/50 hover:bg-slate-700/70 cursor-pointer rounded-md transition-colors">
                    <p className="font-mono text-slate-200">{cmd.command}</p>
                    <p className="text-sm text-slate-400 mt-1">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandGlossaryModal;
