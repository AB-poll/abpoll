import os
import subprocess

import click


@click.command()
def __do_deploy():
    """
        continuously deploying to EC2
    """

    cmd = ["bash", "github_deploy.sh"]
    shell = False
    timeout = None

    if shell:
        subprocess.run(" ".join(cmd), shell=shell, timeout=timeout)
    else:
        subprocess.run(cmd, shell=shell, timeout=timeout)

    return 200, "Success"
