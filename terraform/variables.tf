variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"  # Change to your preferred region
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}