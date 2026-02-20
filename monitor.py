import psutil
import platform
import cpuinfo
import GPUtil
import os

class PCMonitor:
    def __init__(self):
        self.info = {}
        self.refresh_static_info()

    def refresh_static_info(self):
        # OS Info
        self.info['os'] = f"{platform.system()} {platform.release()}"
        self.info['hostname'] = platform.node()
        self.info['processor'] = cpuinfo.get_cpu_info()['brand_raw']
        self.info['arch'] = platform.machine()
        
        # RAM Total
        mem = psutil.virtual_memory()
        self.info['ram_total'] = round(mem.total / (1024**3), 2)
        
        # Disk Info
        self.info['disks'] = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                self.info['disks'].append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'total': round(usage.total / (1024**3), 2),
                    'percent': usage.percent
                })
            except PermissionError:
                continue

    def get_dynamic_info(self):
        # CPU Usage
        cpu_usage = psutil.cpu_percent(interval=1)
        # RAM Usage
        mem = psutil.virtual_memory()
        ram_usage = mem.percent
        
        # GPU Usage
        gpu_info = []
        gpus = GPUtil.getGPUs()
        for gpu in gpus:
            gpu_info.append({
                'name': gpu.name,
                'load': gpu.load * 100,
                'temp': gpu.temperature,
                'mem_used': gpu.memoryUsed,
                'mem_total': gpu.memoryTotal
            })
            
        return {
            'cpu_usage': cpu_usage,
            'ram_usage': ram_usage,
            'gpus': gpu_info
        }

if __name__ == "__main__":
    monitor = PCMonitor()
    print("Static Info:", monitor.info)
    print("Dynamic Info:", monitor.get_dynamic_info())
