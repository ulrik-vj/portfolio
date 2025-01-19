+++
title = 'Automate node exporter updates for Linux and Proxmox'
date = 2025-01-16T23:19:01+01:00
draft = false
banner = "/portfolio/images/post_banner.png"
tags = ["Linux", "Proxmox", "Automation"]
+++

Incase of updates for node-exporter and prometheus exporter (for proxmox), it can be a hassle to go through every single machine and force a update for the node exporter binary files.
A way to make it easier to administrate we can use Ansible.


# The ansible playbook

```yml
- name: Run custom script and upgrade pip on specific host
  hosts: servers  # Applies to all hosts in the 'servers' group
  gather_facts: false
  tasks:
    - name: Load excluded IPs from file. See exclude_ips.txt for info
      set_fact: 
        excluded_ips: >
          {{ lookup('file', 'exclude_ips.txt')
             .splitlines() | default([]) }}
          # Reads the IPs from the file

    - name: Upgrade promethus node exporter on proxmox host
      become: true
      vars:
        ansible_become_pass: "{{ ansible_password }}"
      shell: |
        /opt/prometheus-pve-exporter/bin/pip install --upgrade prometheus-pve-exporter
        # Replace with the desired pip version or binary
      when: inventory_hostname == "192.168.XX.XX"  # Insert your proxmox ip

    - name: Run custom script on all servers, except hosts listed in exclude_ips.txt
      become: true
      vars:
        ansible_become_pass: "{{ ansible_password }}"
      script: scripts/update-nodeexporter.sh
      when: inventory_hostname not in excluded_ips  # Exclude hosts from the list
      register: shell_result

    - name: Output the result of the script
      debug:
        var: shell_result.stdout_lines
      when: inventory_hostname not in excluded_ips and shell_result is defined                                                                 
```
The playbook simply does:

1. Load IPs from excluded IPs file and save those, so the playbook can filter them out later if they dont need update (e.g., host does not use node-exporter).
2. Update prometheus on the proxmox host, with pip by looking for only a specific IP from the hosts file (Your proxmox host IP)
3. Update all servers from hosts file, with a [Custom bash script](https://github.com/ulrik-vj/ansible-playbooks/blob/main/nodeexporter/scripts/update-nodeexporter.sh) that fetches latests node exporter binary file and replace the previous one on the server. Here the excluded IPs are being used. If IP is present from hosts file and also in the excluded file, it will skip that IP.
4. Output from custom bash script, in case you want to see results.

## Script example during a run

In the pictures below im running the playbook in my lab, to update my Proxmox host and VMs:

{{< figure src="/portfolio/images/nodexporter_first.png" title="First part of demo" >}}

{{< figure src="/portfolio/images/nodexporter_second.png" title="Second part of demo" >}}

## How to run Github example

To view an example structure of the playbook, see github repo:

[Github repo example](https://github.com/ulrik-vj/ansible-playbooks/tree/main/nodeexporter)
