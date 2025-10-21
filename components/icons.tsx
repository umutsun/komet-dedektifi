/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AvatarProps } from '../types';

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w.3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.164l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.026,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
  </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const StargazerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
        <path d="M256 256a112 112 0 1 0 112-112 112.12 112.12 0 0 0-112 112Zm0 32a144 144 0 1 1 144-144 144.16 144.16 0 0 1-144 144Z"/>
        <path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32Zm0 416a192 192 0 1 1 192-192 192.22 192.22 0 0 1-192 192Z"/>
    </svg>
);

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 1 1-15 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75h7.5" />
    </svg>
);

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const WifiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 11.886a9.75 9.75 0 0 1 13.728 0M2.008 8.71a14.25 14.25 0 0 1 19.984 0" />
    </svg>
);

export const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

export const WindowMinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
);

interface AvatarIconProps extends React.SVGProps<SVGSVGElement> {
  type?: 'A' | 'B' | 'C';
  color?: string;
}

export const AdamIcon: React.FC<AvatarIconProps> = ({ type = 'A', color = '#00ffff', ...props }) => {
    // Base shape for head and body, in a neutral dark color.
    const baseShape = <path d="M12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12ZM7 20V18C7 15.2386 9.23858 13 12 13C14.7614 13 17 15.2386 17 18V20H7Z" />;
    
    // Different visor shapes
    const visors = {
        'A': <path d="M16 8H11C9.34315 8 8 6.65685 8 5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V8Z" />,
        'B': <path d="M17 6H7C6.44772 6 6 5.55228 6 5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5C18 5.55228 17.5523 6 17 6Z" />,
        'C': <><path d="M10.5 6H7C6.44772 6 6 5.55228 6 5C6 4.44772 6.44772 4 7 4H10.5C11.0523 4 11.5 4.44772 11.5 5C11.5 5.55228 11.0523 6 10.5 6Z" /><path d="M17 6H13.5C12.9477 6 12.5 5.55228 12.5 5C12.5 4.44772 12.9477 4 13.5 4H17C17.5523 4 18 4.44772 18 5C18 5.55228 17.5523 6 17 6Z" /></>,
    };
    
    // Eyes
    const eyes = <><circle cx="10" cy="9.5" r="1.2" /><circle cx="14" cy="9.5" r="1.2" /></>;
    
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor" opacity="0.4">{baseShape}</g>
            <g fill={color}>{visors[type]}</g>
            <g fill="white">{eyes}</g>
        </svg>
    );
};

export const EveIcon: React.FC<AvatarIconProps> = ({ type = 'A', color = '#ff00ff', ...props }) => {
    // Body and Head/Hair base shapes
    const body = <path d="M7 20V18C7 15.2386 9.23858 13 12 13C14.7614 13 17 15.2386 17 18V20H7Z" opacity="0.4" />;
    const headHair = <path d="M18 10V8C18 5.23858 15.7614 3 13 3H11C8.23858 3 6 5.23858 6 8V10H18Z" opacity="0.4" />;

    // Different bangs/fringe styles
    const bangs = {
        'A': <path d="M16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12H16Z" />,
        'B': <path d="M18 10H6C6 8.34315 7.34315 7 9 7H15C16.6569 7 18 8.34315 18 10Z" />, // Straight across bangs
        'C': <path d="M13 12H6C6 9.79086 7.79086 8 10 8C11.5 8 13 9 13 12Z" />, // Side-swept bangs
    };
    
    // Eyes
    const eyes = <><circle cx="10" cy="9.5" r="1.2" /><circle cx="14" cy="9.5" r="1.2" /></>;
    
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill="currentColor">{body}{headHair}</g>
            <g fill={color}>{bangs[type]}</g>
            <g fill="white">{eyes}</g>
        </svg>
    );
};