import process from 'node:process';
const ref = process.env.GITHUB_REF_NAME || '';
const ok = /^feature\/v\d+\.\d+\.\d+-[a-z0-9-]+$/.test(ref) || /^patch\/v\d+\.\d+\.\d+_PATCH-[a-z0-9-]+$/.test(ref) || ref === 'main';
if(!ok){console.error(`Invalid branch name: "${ref}"`);process.exit(1);}console.log('Branch naming OK:', ref);
