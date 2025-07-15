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
  GetUserVerificationStatus,
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

const apiService = {
  signUp: SignUp,
  logIn: LogIn,
  verifyEmail: VerifyEmail,
  resendVerificationEmail: ResendVerificationEmail,
  resetForgotPassword: ResetForgotPassword,
  getUserData: FetchUserData,
  getUserVerificationStatus: GetUserVerificationStatus,
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
export {api}
