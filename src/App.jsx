import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {
	const [currentAccount, setCurrentAccount] = useState('');
	const [waved, setWaved] = useState(false);
	const [isMining, setIsMining] = useState(false);
	const [waves, setWaves] = useState(0);
	const [allWaves, setAllWaves] = useState([]);

	const messageRef = useRef();

	const contractAddress = '0xC6c3c2AC78073a56a19668CA86D23539F4282843';
	const contractABI = abi.abi;

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);

				const signer = provider.getSigner();

				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const waves = await wavePortalContract.getAllWaves();

				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

				setAllWaves(wavesCleaned);
			} else {
				console.log('Ethereum object does not exist...');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Connect your Metamask account first...');
			} else {
				console.log('We have ethereum object ---> ', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);

				getAllWaves();
			} else {
				console.log('No authorised account found.');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getTotalWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);

				const signer = provider.getSigner();

				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();

				setWaves(count.toNumber());
			} else {
				console.log('No ethereum object');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectAccount = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get Metamask');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected --> ', accounts[0]);

			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		setWaved(true);
		const message = messageRef.current.value;

		if (message.trim() === '') return;

		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);

				const signer = provider.getSigner();

				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();

				setWaves(count.toNumber());
				console.log('Retrieved total wave count : ', count.toNumber());

				const waveTxn = await wavePortalContract.wave(message, {
					gasLimit: 300000
				});
				setIsMining(true);
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				setIsMining(false);
				setWaved(false);
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				setWaves(count.toNumber());
				console.log('Retrieved total wave count : ', count.toNumber());

				getAllWaves();
			} else {
				console.log('No ethereum object available.');
			}
		} catch (error) {
			console.log(error);
		} finally {
			messageRef.current.reset();
			setWaved(false);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		getTotalWaves();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">Woahhh It works!</div>

				<div className="bio">
					I am Nimo. I am a frontend developer and am very exited to jump in
					web3. 😁
				</div>

				<h3 className="bio">Nimo got {waves} waves...</h3>

				<label for="message">Message </label>
				<input
					id="message"
					style={{
						padding: '10px',
						margin: '10px 0',
						borderRadius: '7px',
						backgroundColor: '#eeefef',
						color: '#232323'
					}}
					type="text"
					ref={messageRef}
				/>

				<button className="waveButton" onClick={wave} disabled={waved}>
					{!isMining && <p>Wave at me</p>}
					{isMining && <p>Mining...</p>}
				</button>

				{!currentAccount && (
					<>
						<button className="waveButton" onClick={connectAccount}>
							Connect Account
						</button>
					</>
				)}

				{allWaves.map((wave, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: '#eeefef',
								color: '#232323',
								marginTop: '16px',
								padding: '8px',
								borderRadius: '5px'
							}}
						>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
