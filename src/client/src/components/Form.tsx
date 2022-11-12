/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import { Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AppProps {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
}
const Form = (props: AppProps) => {
  const url = 'http://localhost:4000';
  const navigate = useNavigate();
  const [progressBar, setProgressBar] = useState(<p></p>);
  const [errMes, setErrMes] = useState('');

  const client = axios.create({
    baseURL: url
  });

  function validTheme(theme: string) {
    const regex = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
    return regex.test(theme);
  }

  function loading() {
    setProgressBar(<progress className="progress w-56"></progress>);
    setErrMes('');
  }

  function sendError(mes: string) {
    setProgressBar(<p></p>);
    setErrMes(mes);
    props.setTheme('');
  }

  async function submitTheme() {
    loading();
    if (validTheme(props.theme)) {
      console.log(props.theme.toLocaleLowerCase());
      await client
        .get(`/card/${props.theme.toLocaleLowerCase()}`)
        .then((res) => {
          if (res.data[1].length === 0) {
            sendError(
              'Sorry that theme is not available. Try again with another theme.'
            );
          } else {
            navigate(`/results:${props.theme.toLocaleLowerCase()}`, {
              state: { cards: res.data[1], theme: props.theme }
            });
          }
        });
    } else {
      sendError('Please use only numbers and letters');
    }
  }

  async function submitRandomTheme() {
    loading();
    await client.get('/random').then((res) => {
      if (res.data[1].length === 0) {
        sendError(
          'Sorry there was a error with the random theme please try again'
        );
      } else {
        navigate('/random-cards', {
          state: {
            cards: res.data[1],
            theme: decodeURI(res.data[0][0].theme.toLocaleLowerCase())
          }
        });
      }
    });
  }

  return (
    <div className="form-control w-3/5 relative z-0">
      <label className="label">
        <span className="label-text-xl">Enter theme</span>
      </label>
      <label className="input-group input-group-md">
        <input
          type="text"
          placeholder="Kittens"
          className="bg-white input input-md input-bordered w-full"
          value={props.theme}
          onChange={(e) => props.setTheme(e.target.value)}
        />
      </label>
      <div className="h-10">
        {' '}
        <p className=" text-red-700"> {errMes} </p>
      </div>
      <div className="flex flex-row pt-8  justify-center">
        <button
          onClick={() => {
            submitTheme();
          }}
          type="submit"
          className="btn btn-md mx-10"
        >
          Generate
        </button>
        <button
          onClick={() => {
            submitRandomTheme();
          }}
          type="submit"
          className="btn btn-md mx-10"
        >
          Im Feeling Lucky
        </button>
      </div>
      <div className="flex flex-row justify-center pt-10">{progressBar}</div>
    </div>
  );
};

export default Form;
