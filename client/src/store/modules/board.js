import { createAction, handleActions } from 'redux-actions';

//아직 redux를 어떻게 설계해야할지 감이 안온다.혼자하는 소규모 프로젝트에서 굳이 리덕스를 통해 state를 관리할 필요가 있을까...

const CHANGE_INPUT = 'board/CHANGE_INPUT';
const LIST = 'board/LIST';
const LIST2 = 'board/LIST2';
const PAGENUM = 'board/PAGENUM';
const SEARCH = 'board/SEARCH';
const SCROLL = 'board/SCROLL';
const USER = 'board/USER';
const MOBILERELOAD = 'board/MOBILERELOAD';
const RENDERTRIGGER = 'board/RENDERTRIGGER';
const VIEWPOST = 'board/VIEWPOST';
const TOTALPAGE = 'board/TOTALPAGE';
const RELOAD = 'board/RELOAD';
const PAGESIZE = 'board/PAGESIZE';
// createAction 으로 액션 생성함수 정의
export const changeInput = createAction(CHANGE_INPUT, text => text);
export const list = createAction(LIST, list => list);
export const list2 = createAction(LIST2, list => list);
export const pageNum = createAction(PAGENUM);
export const search = createAction(SEARCH);
export const scroll = createAction(SCROLL);
export const user = createAction(USER);
export const mobileReload = createAction(MOBILERELOAD);
export const renderTrigger = createAction(RENDERTRIGGER);
export const viewPost = createAction(VIEWPOST);
export const totalPage = createAction(TOTALPAGE);
export const reload = createAction(RELOAD);
export const pageSize = createAction(PAGESIZE);
// **** 초기 상태 정의
const initialState = {
  reload : false,
  pageSize : 0,
  totalPage : 5,
  viewPost : {},
  renderTrigger : false,
  user : {},
  scroll : 0,
  search: 'title',
  input: '',
  list: [
    // {
    //   id: 0,
    //   name: '홍길동',
    //   entered: true,
    // },
    // {
    //   id: 1,
    //   name: '콩쥐',
    //   entered: false,
    // },
    // {
    //   id: 2,
    //   name: '팥쥐',
    //   entered: false,
    // },
  ],
  list2: [],
  pageNum: 2
};

// **** handleActions 로 리듀서 함수 작성 switch로 안해줘도 편하게 로직을 짤 수 있다.
export default handleActions(
  {
    [CHANGE_INPUT]: (state, action) => ({
      //여기서는 list를 건드리지 않기 때문에 state를 리턴하지 않으면 list가 초기화된다.
      ...state,
      input: action.payload,
    }),
    /* [ENTER]: (state, action) => ({
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
    [CREATE]: (state, action) => ({
        //여기서는 state를 리턴해도 list가 초기화되지않지만 input이 초기화됨
        ...state,
      list: state.list.concat({
        id: action.payload.id,
        name: action.payload.text,
        entered: false,
      }),
    }), */
    [SEARCH]: (state, action) => ({
      ...state,
      search: action.payload
    }),
    [LIST]: (state, action) => ({
      //여기서는 state를 리턴해도 list가 초기화되지않지만 input이 초기화됨
      ...state,
      list: state.list.concat(action.payload),
    }),
    [MOBILERELOAD]: (state, action) => ({
      //여기서는 state를 리턴해도 list가 초기화되지않지만 input이 초기화됨
      ...state,
      list: action.payload,
    }),
    [LIST2]: (state, action) => ({
      ...state,
      list2: action.payload,
    }),
    [PAGENUM]: (state, action) => ({
      ...state,
      pageNum: action.payload + 1,
    }),
    [SCROLL]: (state, action) => ({
      ...state,
      scroll: action.payload,
    }),
    [USER]: (state, action) => ({
      ...state,
      user: action.payload,
    }),
    [RENDERTRIGGER]: (state, action) => ({
      ...state,
      renderTrigger : state.renderTrigger ? false : true,
    }),
    [VIEWPOST]: (state, action) => ({
      ...state,
      viewPost : action.payload
    }),
    [TOTALPAGE]: (state, action) => ({
      ...state,
      totalPage : action.payload
    }),
    [RELOAD]: (state, action) => ({
      ...state,
      reload : action.payload
    }),
    [PAGESIZE]: (state, action) => ({
      ...state,
      pageSize : action.payload
    })
  },
  initialState
);