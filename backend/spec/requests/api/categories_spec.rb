require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    it "returns all categories in alphabetical order" do
      Category.create!(name: "Food")
      Category.create!(name: "Transport")
      Category.create!(name: "Supplies")

      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      
      names = json.map { |c| c["name"] }
      expect(names).to eq(["Food", "Supplies", "Transport"])
    end
  end

  describe "POST /api/categories" do
    it "creates a new category with valid name" do
      params = { category: { name: "Education" } }
      
      expect {
        post "/api/categories", params: params, as: :json
      }.to change(Category, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Education")
    end

    it "fails to create category with empty name" do
      params = { category: { name: "" } }

      expect {
        post "/api/categories", params: params, as: :json
      }.not_to change(Category, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end