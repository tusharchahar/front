import './Profile.css';

import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';

import { Auth } from '../types';

interface Props {
	auth: Auth;
	onLoggedOut: () => void;
}

interface State {
	loading: boolean;
	user: {
		_id: number;
		username: string;
		filledData: boolean;
	}|undefined;
	username: string;
	filled: boolean;
	id:string;
	edit:boolean;
}

interface JwtDecoded {
	payload: {
		id: string;
		publicAddress: string;
	};
}

export const Profile = ({ auth, onLoggedOut }: Props) => {
	const [state, setState] = useState<State>({
		loading: false,
		user: undefined,
		username: '',
		filled:false,
		id:'',
		edit:false
	});
	const [hobby,setHobby] = useState('');
	const [college,setCollege] = useState('');


	useEffect(() => {
		const { accessToken } = auth;
		const {
			payload: { id },
		} = jwtDecode<JwtDecoded>(accessToken);

		fetch(`http://65.1.248.56:443/api/users/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
			.then((response) => response.json())
			.then((user) => {
				//console.log(user);
				setState({ ...state, user,filled:user.filledData,id:user._id });
				})
			.catch(window.alert);
	}, []);

	const handleChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, username: value });
	};

	const { accessToken } = auth;

	const handle=async (event:any)=>{
		event.preventDefault();
 		 const data = {
    		hobby: hobby,
    		college: college,
			parent_id: state.id
  		};


  		try {
    	const response = await fetch('http://65.1.248.56:443/api/data', {
      	method: 'POST',
      	body: JSON.stringify(data),
      	headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json' },
    	});
		setState(prevState => ({
			...prevState,
			filled:true
		  }));
  		} catch (error) {
		console.log(error);
    	// Handle error
  		}
	}
	const update=async (event:any)=>{
		event.preventDefault();
 		 const data = {
    		hobby: hobby,
    		college: college,
  		};
		//console.log(data);


  		try {
    	const response = await fetch(`http://65.1.248.56:443/api/data/${state.id}`, {
      	method: 'PATCH',
      	body: JSON.stringify(data),
      	headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json' },
    	});
		setState(prevState => ({
			...prevState,
			edit:false
		  }));
		setHobby('');
		setCollege('');
  		} catch (error) {
		console.log(error);
    	// Handle error
  		}
	}

	const editField = async(event:any)=>{
		event.preventDefault();
		try {
			const id = state.id;
			const response = await fetch(`http://65.1.248.56:443/api/data/${id}`, {
			  method: 'GET',
			  headers: { Authorization: `Bearer ${accessToken}`,'Content-Type': 'application/json' },
			});
			const data = await response.json();
			setState({ ...state, edit:true });
			setHobby(data[0].hobby);
			setCollege(data[0].college);
		} catch (error) {
			console.log(error);
			// Handle error
		}
	}

	const hobbyChange = (event:any)=>{
		setHobby(event.target.value);
	}

	const collegeChange = (event:any)=>{
		setCollege(event.target.value);
	}

	return (
		<div className="Profile">
			<div>
			{state.filled&&!state.edit ? (
					<div>
					<button type='button' onClick={editField}>view</button>
					</div>
				) : (
					<form>
						<h2>{state.edit?'View and Update Data':'Create data'}</h2>
					<div>
						<label htmlFor='hobby'>hobby</label>
						<input type='text' name='hobby' value={hobby} onChange={hobbyChange}></input>
					</div>
					<div>
					<label htmlFor='college'>college</label>
						<input type='text' name='college' value={college} onChange={collegeChange}></input>
					</div>
					<button type='button' onClick={state.edit?update:handle}>{state.edit?'Update Data':'Submit data'}</button>
				</form>
				)}
			</div>
			<p>
				<button onClick={onLoggedOut}>Logout</button>
			</p>
		</div>
	);
};
