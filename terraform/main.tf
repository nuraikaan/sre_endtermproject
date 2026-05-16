terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
    }
    null = {
      source = "hashicorp/null"
    }
  }
}

resource "local_file" "vm_config" {
  filename = "${path.module}/vm_instance.json"
  content  = jsonencode({
    instance = {
      name          = "microservices-server"
      instance_type = var.instance_type
      ami           = var.ami_id
      region        = var.region
      public_ip     = "54.175.100.200"
      state         = "running"
    }
  })
}

resource "local_file" "security_group" {
  filename = "${path.module}/security_group.json"
  content  = jsonencode({
    security_group = {
      name        = "microservices-sg"
      description = "Security group for microservices app"
      ingress_rules = [
        { port = 22,   protocol = "tcp", description = "SSH",        cidr = "0.0.0.0/0" },
        { port = 80,   protocol = "tcp", description = "HTTP",       cidr = "0.0.0.0/0" },
        { port = 3000, protocol = "tcp", description = "Grafana",    cidr = "0.0.0.0/0" },
        { port = 9090, protocol = "tcp", description = "Prometheus", cidr = "0.0.0.0/0" }
      ]
      egress_rules = [
        { port = 0, protocol = "-1", cidr = "0.0.0.0/0" }
      ]
    }
  })
}

resource "null_resource" "provision" {
  provisioner "local-exec" {
    command = "echo 'VM microservices-server provisioned at 54.175.100.200 with ports 22, 80, 3000, 9090 open'"
  }

  depends_on = [
    local_file.vm_config,
    local_file.security_group
  ]
}