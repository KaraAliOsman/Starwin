import React from 'react';

const paths={
 arrow:'M4 12h15m-6-6 6 6-6 6',
 diagonal:'M5 19 19 5M5 5h14v14',
 plus:'M12 5v14M5 12h14',
 check:'m5 12 4 4L19 6',
 download:'M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4',
};

export default function ControlIcon({name='arrow'}:{name?:keyof typeof paths}){
 return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
