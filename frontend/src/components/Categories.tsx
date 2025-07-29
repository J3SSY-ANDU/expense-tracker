import React, { JSX } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Button
} from '@mui/material'
import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Category,
  NewCategory,
  Expense,
  History as MonthlyHistory
} from '../types'
import apiService from '../api/apiService'
import { CategoryCard } from './index'
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SchoolIcon from '@mui/icons-material/School'
import MovieIcon from '@mui/icons-material/Movie'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import WorkIcon from '@mui/icons-material/Work'
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function Categories({
  categories,
  setCategories,
  expenses,
  setExpenses,
  setHistory,
  handleUpdateData
}: {
  categories: Category[] | null
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>
  expenses: Expense[] | null
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>
  setHistory: React.Dispatch<React.SetStateAction<MonthlyHistory[] | null>>
  handleUpdateData: (updatedExpense: Expense) => Promise<void> // Function to update expense data
}) {
  const [newExpensesByCategory, setNewExpensesByCategory] = useState<
    Expense[] | null
  >(null) // State for new expenses by category
  const [loading, setLoading] = useState<boolean>(true) // State for loading
  const [newCategory, setNewCategory] = useState<boolean>(false) // State for new category
  const [newCategoryName, setNewCategoryName] = useState<string>('') // State for category name
  const newCategoryRef = useRef<HTMLInputElement | null>(null) // Reference to the new category DOM element
  const [openCategory, setOpenCategory] = useState<boolean>(false) // State for backdrop
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  ) // State for selected category
  const MAX_VISIBLE_CATEGORIES = 8;
  const [showAll, setShowAll] = useState<boolean>(true) // State to toggle showing all categories
  const visibleCategories = showAll
    ? categories?.slice(0, MAX_VISIBLE_CATEGORIES)
    : categories;

  const categoryIcon = (categoryName: string, size?: number): JSX.Element | null => {
    switch (categoryName.trim().toLocaleLowerCase().replace(/\s/g, '_')) {
      case 'bills_&_utilities':
        return <WaterDropIcon sx={{ fontSize: size || 24 }} />
      case 'education':
        return <SchoolIcon sx={{ fontSize: size || 24 }} />
      case 'entertainment':
        return <MovieIcon sx={{ fontSize: size || 24 }} />
      case 'food_&_groceries':
        return <RestaurantIcon sx={{ fontSize: size || 24 }} />
      case 'health_&_fitness':
        return <MonitorHeartIcon sx={{ fontSize: size || 24 }} />
      case 'shopping':
        return <ShoppingBagIcon sx={{ fontSize: size || 24 }} />
      case 'transportation':
        return <DirectionsBusIcon sx={{ fontSize: size || 24 }} />
      case 'travel':
        return <WorkIcon sx={{ fontSize: size || 24 }} />
      default:
        return null
    }
  }

  useEffect(() => {
    if (selectedCategory) {
      const filteredExpenses =
        expenses?.filter(
          expense => expense.category_id === selectedCategory.id
        ) || [] // Ensure it's always an array

      setNewExpensesByCategory(filteredExpenses)
    }
  }, [expenses, selectedCategory])

  useEffect(() => {
    if (!newExpensesByCategory || !expenses) return

    const updatedMap = new Map(newExpensesByCategory.map(e => [e.id, e]))
    let hasChanged = false

    const newParentExpenses = expenses.map(exp => {
      if (updatedMap.has(exp.id)) {
        const updatedExp = updatedMap.get(exp.id)
        if (
          updatedExp &&
          (exp.name !== updatedExp.name ||
            exp.amount !== updatedExp.amount ||
            exp.category_id !== updatedExp.category_id ||
            exp.date !== updatedExp.date ||
            exp.notes !== updatedExp.notes)
        ) {
          hasChanged = true
          return { ...updatedExp }
        }
      }
      return exp
    })

    if (hasChanged) {
      setExpenses(newParentExpenses)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newExpensesByCategory])

  const handleSaveCategory = useCallback(async () => {
    const newCategoryData: NewCategory = {
      name: newCategoryName,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      total_expenses: 0,
      description: ''
    }
    if (newCategoryName) {
      // Save category

      const createdCategory = await apiService.addCategory(newCategoryData)
      if (!createdCategory || 'error' in createdCategory) {
        console.error('Failed to create category:', createdCategory)
        // Add any additional error handling here if needed
        return
      }
      setCategories(prev => {
        return prev ? [...prev, createdCategory] : [createdCategory]
      })
      setNewCategory(false)
      setNewCategoryName('')
    } else {
      console.log('Category name cannot be empty.')
      setNewCategory(false)
      setNewCategoryName('')
    }
  }, [newCategoryName, setCategories])

  useEffect(() => {
    if (categories) {
      setLoading(false)
    }

    // Handle clicking outside or pressing Enter
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        newCategoryRef.current &&
        !newCategoryRef.current.contains(event.target as Node)
      ) {
        handleSaveCategory()
      }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSaveCategory()
      }
    }

    if (newCategory) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [categories, newCategory, handleSaveCategory])

  const handleChangeName = async () => {
    if (!selectedCategory) return

    const currentCategory = categories?.find(
      category => category.id === selectedCategory.id
    )

    // Check if the name has changed
    if (currentCategory && currentCategory.name === selectedCategory.name) {
      console.log('No changes detected in name.')
      return
    }

    const updatedCategory = await apiService.updateCategoryName(
      selectedCategory.id,
      selectedCategory.name
    )
    if (!updatedCategory || 'error' in updatedCategory) {
      console.error(`Error updating category name: ${updatedCategory?.error}`)
      // Add any additional error handling here if needed

      return
    }
    setCategories(prev => {
      return prev
        ? prev.map(category =>
          category.id === updatedCategory.id ? updatedCategory : category
        )
        : null
    })
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }
    console.log('Name updated successfully.')
  }

  const handleChangeDescription = async () => {
    if (!selectedCategory) return

    const currentCategory = categories?.find(
      category => category.id === selectedCategory.id
    )

    // Check if the description has changed
    if (
      currentCategory &&
      currentCategory.description === selectedCategory.description
    ) {
      console.log('No changes detected in description.')
      return
    }

    const updatedCategory = await apiService.updateCategoryDescription(
      selectedCategory.id,
      selectedCategory.description
    )
    if (!updatedCategory || 'error' in updatedCategory) {
      console.error(
        `Error updating category description: ${updatedCategory?.error}`
      )
      // Add any additional error handling here if needed
      return
    }
    setCategories(prev => {
      return prev
        ? prev.map(category =>
          category.id === updatedCategory.id ? updatedCategory : category
        )
        : null
    })
    const activeElement = document.activeElement as HTMLElement
    if (activeElement) {
      activeElement.blur()
    }
    console.log('Description updated successfully.')
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    if (expenses) {
      // Collect IDs to delete
      const expenseIdsToDelete = expenses
        .filter(expense => expense.category_id === selectedCategory.id)
        .map(expense => expense.id);

      // Delete all expenses in backend
      await Promise.all(
        expenseIdsToDelete.map(id => apiService.deleteExpense(id))
      );

      // Filter out all deleted expenses in one go
      setExpenses(prev =>
        prev ? prev.filter(exp => !expenseIdsToDelete.includes(exp.id)) : null
      );
    }
    const isDeleted = await apiService.deleteCategory(selectedCategory.id)
    if (isDeleted && typeof isDeleted === 'object' && 'error' in isDeleted) {
      console.error(`Error deleting category: ${isDeleted.error}`)
      // Add any additional error handling here if needed
      return
    }
    setCategories(prev => {
      return prev
        ? prev.filter(category => category.id !== selectedCategory.id)
        : null
    })
    setSelectedCategory(null)
    setOpenCategory(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <Typography fontSize={20} fontWeight={'600'}>
          Categories
        </Typography>
        <Button
          variant='contained'
          color='primary'
          size='small'
          onClick={() => {
            setShowAll(false)
            setNewCategory(true)
          }}
        >
          New Category
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid2 container spacing={4}>
          {visibleCategories?.map(category => {
            return (
              <Grid2 key={category.id} size={3}>
                <Card
                  sx={{
                    background: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                  elevation={0}
                  onClick={() => {
                    setOpenCategory(true)
                    setSelectedCategory(category)
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                      {categoryIcon(category.name)}
                      <Typography
                        fontSize={16}
                        fontWeight={'600'}
                        marginBottom={'1rem'}
                      >
                        {category.name}
                      </Typography>
                    </Box>
                    <Typography fontSize={14} fontWeight={'400'}>
                      ${category.total_expenses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            )
          })}
          {newCategory && (
            <Grid2 size={3}>
              <Card sx={{ background: '#f5f5f5' }}>
                <CardContent>
                  <input
                    type='text'
                    placeholder='Enter category name'
                    onChange={e => setNewCategoryName(e.target.value)}
                    autoFocus
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      marginBottom: '1rem',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                    ref={newCategoryRef}
                  />
                  <Typography fontSize={14} fontWeight={'400'}>
                    $0.00
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          )}
        </Grid2>
        {categories && categories.length > MAX_VISIBLE_CATEGORIES && (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <Button
              onClick={() => setShowAll(v => !v)}
              sx={{
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.3s, opacity 0.3s',
              opacity: 0.5,
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'inherit',
                opacity: 1,
              }
              }}
              disableRipple
              disableElevation
            >
              {showAll ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography fontSize={14}>See more</Typography>
                <ExpandMoreIcon fontSize='small' />
              </Box>
              ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ExpandLessIcon fontSize='small' />
                <Typography fontSize={14}>See less</Typography>
              </Box>
              )}
            </Button>
          </Box>
        )}
        <CategoryCard
          categoryIcon={categoryIcon}
          newExpensesByCategory={newExpensesByCategory}
          setNewExpensesByCategory={setNewExpensesByCategory}
          setExpenses={setExpenses}
          categories={categories}
          setCategories={setCategories}
          setHistory={setHistory}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          openCategory={openCategory}
          setOpenCategory={setOpenCategory}
          handleChangeName={handleChangeName}
          handleChangeDescription={handleChangeDescription}
          handleDeleteCategory={handleDeleteCategory}
          handleUpdateData={handleUpdateData}
        />
      </Box>
    </Box>
  )
}
