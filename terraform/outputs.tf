output "public_ip" {
  value       = "54.175.100.200"
  description = "Public IP of the server"
}

output "instance_name" {
  value       = "microservices-server"
  description = "VM instance name"
}

output "security_group_name" {
  value       = "microservices-sg"
  description = "Security group name"
}

output "open_ports" {
  value       = [22, 80, 3000, 9090]
  description = "Open ports on the instance"
}