import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { fetchCategories, createCategory } from "../services/api";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [customCategory, setCustomCategory] = useState("");

  const handleFormSubmit = async (data: ExpenseFormData) => {
    let finalCategory = data.category;
    if (data.category === "Other" && customCategory.trim()) {
      try {
        const newCat = await createCategory(customCategory.trim());
        finalCategory = newCat.name;
      } catch (err) {
        console.error(err);
      }
    }
    await onSubmit({ ...data, category: finalCategory });
  };

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit: handleFormSubmit,
    });

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);
  const categoryOptions = categories
    .filter((c) => c.name !== "Other")
    .concat(categories.filter((c) => c.name === "Other"))
    .map((category) => ({
      value: category.name,
      label: category.name,
    }));

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      <SelectBox
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        error={errors.category}
        fullWidth
        required
      />

      {formData.category === "Other" && (
        <TextField
          label="Custom Category"
          placeholder="Enter custom category name"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          fullWidth
          required
        />
      )}

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
