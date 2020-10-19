import React from 'react';
import { hydrate, render} from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css'
// createStore 와 루트 리듀서 불러오기
import { createStore } from 'redux';
import rootReducer from './store/modules';
// **** (1) Provider 불러오기
import { Provider } from 'react-redux';
import dotenv from 'dotenv'
import { HelmetProvider } from 'react-helmet-async'


dotenv.config()
// 리덕스 개발자도구 적용
//크롬에서 리덕스 상태를 쉽게 확인할 수있음
const devTools =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
if(process.env.REACT_APP_NODE_ENV.trim().toLowerCase() === 'development')
  var store = createStore(rootReducer, devTools)
else
  var store = createStore(rootReducer)

const rootElement = document.getElementById('root')

if(rootElement.hasChildNodes()){
  hydrate(<HelmetProvider><Provider store={store}><App/></Provider></HelmetProvider>, rootElement)
}else{
  render(<HelmetProvider><Provider store={store}><App/></Provider></HelmetProvider>,rootElement)
}

// ReactDOM.render(
//   <React.StrictMode>
//     {/* {process.env.REACT_APP_NODE_ENV.trim().toLowerCase() === 'development' ? <Provider store={store}><App /></Provider> : <App/> } */}
//     <Provider store={store}>
//       <App />
//       </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
