// src/components/reviewForm/ReviewForm.jsx

import { useState } from 'react'

import './ReviewForm.css'

function ReviewForm({
  review = null,
  onSave,
  onCancel
}) {

  const [rating, setRating] =
    useState(
      review?.rating || 5
    )

  const [comment, setComment] =
    useState(
      review?.comment || ''
    )

  const handleSubmit = (e) => {

    e.preventDefault()

    if (!comment.trim()) {
      alert(
        'Ingresa un comentario'
      )
      return
    }

    onSave({
      rating,
      comment
    })
  }

  return (

    <div className="review-modal">

      <div className="review-form-card">

        <h2>

          {
            review
              ? 'Editar reseña'
              : 'Nueva reseña'
          }

        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <label>
            Calificación
          </label>

          <select
            value={rating}
            onChange={(e) =>
              setRating(
                Number(
                  e.target.value
                )
              )
            }
          >
            <option value={1}>
              1 ⭐
            </option>

            <option value={2}>
              2 ⭐
            </option>

            <option value={3}>
              3 ⭐
            </option>

            <option value={4}>
              4 ⭐
            </option>

            <option value={5}>
              5 ⭐
            </option>
          </select>

          <label>
            Comentario
          </label>

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(
                e.target.value
              )
            }
            placeholder="
            Comparte tu experiencia..."
          />

          <div className="review-buttons">

            <button
              type="submit"
              className="save-review-btn"
            >
              Guardar
            </button>

            <button
              type="button"
              className="cancel-review-btn"
              onClick={onCancel}
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>

  )
}

export default ReviewForm