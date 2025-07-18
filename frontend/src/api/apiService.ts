import axios from 'axios'
import {
  AddCategory,
  ChangeName,
  ChangePassword,
  CreateExpense,
  DeleteCategory,
  DeleteExpense,
  DeleteUser,
  FetchCategoriesData,
  FetchExpensesData,
  FetchHistoryData,
  FetchUserData,
  ForgotPassword,
  GenerateCategoryData,
  GetCategory,
  LogIn,
  ResendVerificationEmail,
  ResetForgotPassword,
  SignUp,
  UpdateCategoryDescription,
  UpdateCategoryName,
  UpdateExpense,
  VerifyEmail
} from './'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          console.log(`error response: ${error.response.status}`)
          // window.location.href = '/login' // Or show a modal
          break;
        case 500:
          break;
        default:
          break;
      }
    }
    return Promise.reject(error)
  }
)

const apiService = {
  signUp: SignUp,
  logIn: LogIn,
  verifyEmail: VerifyEmail,
  resendVerificationEmail: ResendVerificationEmail,
  resetForgotPassword: ResetForgotPassword,
  getUserData: FetchUserData,
  changePassword: ChangePassword,
  changeName: ChangeName,
  deleteUser: DeleteUser,
  forgotPassword: ForgotPassword,
  getCategoriesData: FetchCategoriesData,
  generateCategoryData: GenerateCategoryData,
  getCategory: GetCategory,
  addCategory: AddCategory,
  updateCategoryName: UpdateCategoryName,
  updateCategoryDescription: UpdateCategoryDescription,
  deleteCategory: DeleteCategory,
  getExpensesData: FetchExpensesData,
  createExpense: CreateExpense,
  updateExpense: UpdateExpense,
  deleteExpense: DeleteExpense,
  getHistoryData: FetchHistoryData
}

export default apiService
export { api }
