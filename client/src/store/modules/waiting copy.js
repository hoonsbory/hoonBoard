import { createAction, handleActions } from 'redux-actions';

//아직 redux를 어떻게 설계해야할지 감이 안온다.혼자하는 소규모 프로젝트에서 굳이 리덕스를 통해 state를 관리할 필요가 있을까...

const CHANGE_INPUT = 'board/CHANGE_INPUT'; // 인풋 값 변경
const CREATE = 'board/CREATE'; // 명단에 이름 추가
const ENTER = 'board/ENTER'; // 입장
const LEAVE = 'board/LEAVE'; // 나감

let id = 3;
// createAction 으로 액션 생성함수 정의
export const changeInput = createAction(CHANGE_INPUT, text => text);
export const create = createAction(CREATE, text => ({ text, id: id++ }));
export const enter = createAction(ENTER, id => id);
export const leave = createAction(LEAVE, id => id);

// **** 초기 상태 정의
const initialState = {
  input: '',
  list: [
    {
      id: 0,
      name: '홍길동',
      entered: true,
    },
    {
      id: 1,
      name: '콩쥐',
      entered: false,
    },
    {
      id: 2,
      name: '팥쥐',
      entered: false,
    },
  ],
};

// **** handleActions 로 리듀서 함수 작성 switch로 안해줘도 편하게 로직을 짤 수 있다.
export default handleActions(
  {
    [CHANGE_INPUT]: (state, action) => ({
        //여기서는 list를 건드리지 않기 때문에 state를 리턴하지 않으면 list가 초기화된다.
      ...state,
      input: action.payload,
    }),
    [CREATE]: (state, action) => ({
        //여기서는 state를 리턴해도 list가 초기화되지않지만 input이 초기화됨
        ...state,
      list: state.list.concat({
        id: action.payload.id,
        name: action.payload.text,
        entered: false,
      }),
    }),
    [ENTER]: (state, action) => ({
        ...state,
      list: state.list.map(
        item =>
          item.id === action.payload
            ? { ...item, entered: !item.entered }
            : item
      ),
    }),
    [LEAVE]: (state, action) => ({
        ...state,
      list: state.list.filter(item => item.id !== action.payload),
    }),
  },
  initialState
);