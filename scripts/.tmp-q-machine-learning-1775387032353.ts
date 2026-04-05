import { createClient } from "@libsql/client";
import crypto from "crypto";
const db = createClient({ url: "file:local.db" });
const questions = [
  {
    id: crypto.randomUUID(),
    question: "What is the difference between supervised and unsupervised learning? Provide an example of each.",
    answer: "Supervised learning uses labeled data to train models on input-output pairs, while unsupervised learning finds patterns in unlabeled data without predefined targets.",
    explanation: "## Supervised vs Unsupervised Learning\n\n**Supervised Learning** uses labeled training data where each input is paired with a known output. The model learns a mapping function from inputs to outputs by minimizing a loss function. Common algorithms include regression, decision trees, SVMs, and neural networks.\n\n**Unsupervised Learning** works with unlabeled data, finding hidden patterns or structures. The model tries to learn the underlying distribution of data without explicit guidance.\n\n## Examples\n\n- **Supervised**: Email spam detection — train on emails labeled as spam/not-spam, predict labels for new emails\n- **Unsupervised**: Customer segmentation — cluster customers based on purchasing behavior without predefined groups\n\n## Key Differences\n\n| Aspect | Supervised | Unsupervised |\n|--------|------------|--------------|\n| Data | Labeled | Unlabeled |\n| Objective | Predict outcomes | Find patterns |\n| Algorithms | Classification, Regression | Clustering, Dimensionality Reduction |\n| Evaluation | Accuracy, F1, RMSE | Silhouette, Inertia |\n\n```python\n# Supervised example
from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)  # y_train contains labels\npredictions = model.predict(X_test)\n\n# Unsupervised example\nfrom sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=3)\nkmeans.fit(X_unlabeled)  # No labels needed\n```",
    eli5: "Supervised learning is like having a teacher with answer keys. Unsupervised is like exploring data to find hidden groups without knowing what you're looking for.",
    difficulty: "beginner",
    tags: JSON.stringify(["machine-learning", "fundamentals"]),
    channel: "machine-learning",
    subChannel: "supervised-learning",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Explain the bias-variance tradeoff. How does it affect model performance and how can you diagnose bias vs variance issues?",
    answer: "High bias causes underfitting (oversimplified model), high variance causes overfitting (too sensitive to training data). Use validation error analysis to diagnose which issue is present.",
    explanation: "## The Bias-Variance Tradeoff\n\n**Bias** is error from oversimplified assumptions. High bias leads to underfitting — the model misses patterns in the data.\n\n**Variance** is error from sensitivity to training data fluctuations. High variance leads to overfitting — the model memorizes noise.\n\n## Mathematical Decomposition\n\nTotal error = Bias² + Variance + Irreducible Error\n\n## Diagnosing Issues\n\n| Scenario | Training Error | Validation Error | Diagnosis |\n|----------|---------------|------------------|------------|\n| High bias | High | High | Underfitting |\n| High variance | Low | High | Overfitting |\n| Both low | Low | Low | Good fit |\n\n```python\n# Diagnose bias-variance from learning curves\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.model_selection import learning_curve\n\ntrain_sizes, train_scores, val_scores = learning_curve(\n    model, X, y, cv=5, scoring='neg_mean_squared_error'\n)\n\ntrain_errors = -train_scores.mean(axis=1)\nval_errors = -val_scores.mean(axis=1)\n\n# High bias: both errors converge at high value\n# High variance: large gap between train and val errors\n```\n\n## Solutions\n\n- **High bias**: Add features, decrease regularization, use more complex model\n- **High variance**: Add training data, reduce features, increase regularization",
    eli5: "Bias is when your model is too simple and keeps making the same mistake. Variance is when your model is too sensitive and gives different answers for similar inputs.",
    difficulty: "intermediate",
    tags: JSON.stringify(["machine-learning", "model-evaluation"]),
    channel: "machine-learning",
    subChannel: "model-evaluation",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "What is gradient descent and how does stochastic gradient descent (SGD) differ from batch gradient descent?",
    answer: "Batch GD computes gradients on the full dataset (stable but slow), while SGD uses single samples (fast but noisy). Mini-batch SGD balances both by using small batches.",
    explanation: "## Gradient Descent Variants\n\n**Gradient Descent** optimizes by iteratively moving toward the steepest descent of a loss function.\n\n### Batch Gradient Descent\n- Computes gradient using **entire dataset**\n- Stable convergence, smooth trajectory\n- Slow for large datasets, high memory usage\n\n### Stochastic Gradient Descent (SGD)\n- Computes gradient using **single sample**\n- Fast iterations, can escape local minima\n- Noisy convergence, may overshoot\n\n### Mini-Batch SGD\n- Uses **batches of samples** (typically 32-256)\n- Balances speed and stability\n- Industry standard for deep learning\n\n```python\n# Batch gradient descent
for epoch in range(num_epochs):\n    gradient = compute_full_gradient(X, y, weights)  # All samples\n    weights -= learning_rate * gradient\n\n# SGD\nfor epoch in range(num_epochs):\n    for i in range(len(X)):\n        gradient = compute_gradient(X[i], y[i], weights)  # Single sample\n        weights -= learning_rate * gradient\n\n# Mini-batch SGD (PyTorch style)\nfor epoch in range(num_epochs):\n    indices = np.random.permutation(len(X))\n    for start in range(0, len(X), batch_size):\n        batch_idx = indices[start:start + batch_size]\n        gradient = compute_gradient(X[batch_idx], y[batch_idx], weights)\n        weights -= learning_rate * gradient\n```\n\n## Convergence Behavior\n\n- Batch GD: Smooth, guaranteed convergence (convex)\n- SGD: Oscillates toward optimum, may never fully converge\n- Use learning rate scheduling (decay) for SGD convergence",
    eli5: "Gradient descent is like rolling a ball downhill to find the lowest point. SGD rolls it quickly but zigzags, while batch GD moves slowly but steadily.",
    difficulty: "intermediate",
    tags: JSON.stringify(["machine-learning", "optimization"]),
    channel: "machine-learning",
    subChannel: "neural-networks",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "What is feature engineering and why is it important? Describe three common feature engineering techniques for structured data.",
    answer: "Feature engineering transforms raw data into meaningful features that improve model performance. Key techniques include imputation, encoding categoricals, and creating interaction features.",
    explanation: "## Feature Engineering Overview\n\nFeature engineering transforms raw data into representations that better capture the underlying problem, improving model performance and sometimes more impactful than algorithm choice.\n\n## Three Key Techniques\n\n### 1. Handling Missing Values (Imputation)\n\n```python\nimport numpy as np\nimport pandas as pd\nfrom sklearn.impute import SimpleImputer, KNNImputer\n\n# Mean/median imputation for numerical\nimputer = SimpleImputer(strategy='median')\nX_imputed = imputer.fit_transform(X)\n\n# KNN imputation (considers similar rows)\nknn_imputer = KNNImputer(n_neighbors=5)\nX_imputed = knn_imputer.fit_transform(X)\n```\n\n### 2. Encoding Categorical Variables\n\n```python\nfrom sklearn.preprocessing import OneHotEncoder, LabelEncoder, TargetEncoder\n\n# One-hot encoding (nominal categories)\nohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')\nX_encoded = ohe.fit_transform(X categorical)\n\n# Target encoding (high cardinality)\ntarget_encoder = TargetEncoder(smoothing=1.0)\nX_encoded = target_encoder.fit_transform(X_categorical, y)\n```\n\n### 3. Creating Interaction Features\n\n```python\nfrom sklearn.preprocessing import PolynomialFeatures\n\n# Polynomial features for non-linear relationships\npoly = PolynomialFeatures(degree=2, include_bias=False)\nX_poly = poly.fit_transform(X[['feature1', 'feature2']])\n\n# Manual interaction\ndf['interaction'] = df['feature1'] * df['feature2']\ndf['ratio'] = df['feature1'] / (df['feature2'] + 1e-5)\n```\n\n## Best Practices\n\n- Domain knowledge drives effective feature creation\n- Always validate on held-out data\n- Beware of data leakage in target encoding",
    eli5: "Feature engineering is like choosing the right ingredients and preparing them properly before cooking. Raw data often needs transformation to be useful for learning.",
    difficulty: "intermediate",
    tags: JSON.stringify(["machine-learning", "preprocessing"]),
    channel: "machine-learning",
    subChannel: "feature-engineering",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    question: "Explain backpropagation in neural networks. How does the chain rule apply, and what are common challenges like vanishing gradients?",
    answer: "Backpropagation computes gradients of the loss with respect to weights using the chain rule, propagating errors backward through layers. Vanishing gradients occur when gradients become exponentially small in deep networks.",
    explanation: "## Backpropagation Algorithm\n\nBackpropagation computes gradients by applying the chain rule of calculus, moving backward through the network from output to input.\n\n### Forward Pass\n```\ninput → linear(X·W + b) → activation → ... → output → loss\n```\n\n### Backward Pass\n```\n∂L/∂W = ∂L/∂ŷ · ∂ŷ/∂a · ∂a/∂z · ∂z/∂W  (chain rule)\n```\n\n### Implementation\n\n```python\nclass NeuralNetwork:\n    def __init__(self):\n        self.W1 = np.random.randn(input_size, hidden_size) * 0.01\n        self.b1 = np.zeros((1, hidden_size))\n        \n    def backward(self, d_loss_d_output):\n        # Gradient through activation\n        d_loss_d_activation = d_loss_d_output * self.activation_derivative(self.z2)\n        \n        # Gradient through weights\n        d_loss_d_W2 = np.dot(self.a1.T, d_loss_d_activation)\n        \n        # Gradient for previous layer (chain rule continues)\n        d_loss_d_a1 = np.dot(d_loss_d_activation, self.W2.T)\n        \n        # Update weights\n        self.W2 -= learning_rate * d_loss_d_W2\n        return d_loss_d_a1\n```\n\n## Vanishing Gradients Problem\n\nWhen gradients multiply through many layers with sigmoid/tanh activations, they shrink exponentially.\n\n```python\n# Sigmoid derivative max: 0.25\n# With 5 layers: 0.25^5 = 0.001 (nearly zero!)\n\n# Solutions:\n# 1. ReLU activation (derivative is 1 for positive inputs)\n# 2. Residual connections (skip layers)\n# 3. Batch normalization\n# 4. LSTM/GRU for RNNs\n```\n\n## Exploding Gradients\n\nOpposite problem — gradients grow exponentially. Solutions include gradient clipping and proper weight initialization (Xavier/He).",
    eli5: "Backpropagation is like finding out how much each person in a chain contributed to a mistake by working backwards. Vanishing gradients are when the feedback becomes too weak to learn from.",
    difficulty: "advanced",
    tags: JSON.stringify(["machine-learning", "deep-learning"]),
    channel: "machine-learning",
    subChannel: "neural-networks",
    createdAt: new Date().toISOString()
  }
];
async function main() {
  for (const q of questions) {
    await db.execute({ sql: `INSERT OR IGNORE INTO questions (id,question,answer,explanation,eli5,difficulty,tags,channel,sub_channel,status,is_new,created_at,last_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [q.id,q.question,q.answer,q.explanation,q.eli5,q.difficulty,q.tags,q.channel,q.subChannel,"active",1,q.createdAt,q.createdAt] });
  }
  db.close();
  console.log("Inserted", questions.length, "questions for machine-learning");
}
main().catch(e=>{console.error(e.message);process.exit(1);});
